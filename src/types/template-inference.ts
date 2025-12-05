/**
 * Template Type Inference System
 *
 * Uses TypeScript template literal types to infer the expected data structure
 * from a Handlebars template string at compile time.
 *
 * ⚠️ IMPORTANT LIMITATIONS:
 * - TypeScript has recursion limits, so deeply nested templates may not fully infer
 * - Complex helper expressions may not be fully parsed
 * - Custom transformers registered at runtime are NOT visible to the type system
 * - Partials ({{> ...}}) prevent full inference since their content is unknown
 * - Transformers that modify data structure (e.g., filter, map) cannot be understood
 *
 * 💡 RECOMMENDED APPROACH:
 * For production code with custom transformers or partials, use a schema (Zod/Valibot)
 * with PromptWeaver for full type safety and runtime validation:
 *
 * ```ts
 * import { z } from 'zod';
 * const schema = z.object({ name: z.string(), count: z.number() });
 * const weaver = new PromptWeaver(template, { schema });
 * ```
 *
 * Type inference is best-effort and works well for simple templates without
 * custom transformers or partials. For complex cases, schemas are the reliable solution.
 *
 * @example
 * ```ts
 * const template = `Hello {{name}}! You have {{count}} items.` as const;
 * type Data = InferTemplateData<typeof template>;
 * // Data = { name: unknown; count: unknown }
 * ```
 */

// ============================================================================
// Utility Types
// ============================================================================

/** Clean up intersection types for better IDE display */
type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

// ============================================================================
// Variable Extraction - Extract {{variable}} patterns
// ============================================================================

/** Skip content inside {{#with}} blocks (context changes, vars are properties not data) */
type SkipWithBlocks<S extends string> =
  S extends `${infer Before}{{#with ${string}}}${string}{{/with}}${infer After}`
    ? SkipWithBlocks<`${Before}${After}`>
    : S;

/** Extract single mustache content, skipping blocks */
type ExtractSingleVar<S extends string> =
  SkipWithBlocks<S> extends infer Cleaned
    ? Cleaned extends `${string}{{${infer Content}}}${infer Rest}`
      ? Content extends `#${string}` | `/${string}` | `^${string}` | `>${string}` | `!${string}`
        ? ExtractSingleVar<Rest>
        : TrimContent<Content> | ExtractSingleVar<Rest>
      : never
    : never;

/** Trim whitespace from content */
type TrimContent<S extends string> = S extends ` ${infer R}`
  ? TrimContent<R>
  : S extends `${infer R} `
    ? TrimContent<R>
    : S;

/** Check if a token is a valid variable (not a literal, subexpression, or keyword) */
type IsValidVar<S extends string> = S extends
  | `'${string}`
  | `"${string}`
  | `(${string}`
  | `${string})`
  | `${string}'`
  | `${string}"`
  | `${number}`
  | "else"
  | "true"
  | "false"
  | "null"
  | "undefined"
  | "this"
  | `@${string}`
  | ""
  ? false
  : // Also check for tokens that contain quotes or parens in the middle (format strings)
    S extends
        | `${string}'${string}`
        | `${string}"${string}`
        | `${string}(${string}`
        | `${string})${string}`
    ? false
    : true;

/** Filter token - return it if valid variable, otherwise never */
type FilterValidVar<S extends string> = IsValidVar<S> extends true ? S : never;

/** Skip a quoted string and return the rest */
type SkipQuotedString<S extends string, Quote extends string> = S extends `${Quote}${infer Rest}`
  ? Rest
  : S extends `${string}${Quote}${infer Rest}`
    ? Rest
    : S;

/** Extract tokens AFTER the first one (helper arguments), skipping quoted strings */
type ExtractHelperArgs<S extends string> =
  // Skip single-quoted strings
  S extends `'${infer AfterQuote}`
    ? ExtractHelperArgs<SkipQuotedString<AfterQuote, "'">>
    : // Skip double-quoted strings
      S extends `"${infer AfterQuote}`
      ? ExtractHelperArgs<SkipQuotedString<AfterQuote, '"'>>
      : // Skip subexpressions (...)
        S extends `(${infer _Inside})${infer Rest}`
        ? ExtractHelperArgs<Rest>
        : // Normal token processing
          S extends `${infer Token} ${infer Rest}`
          ? FilterValidVar<Token> | ExtractHelperArgs<Rest>
          : FilterValidVar<S>;

/**
 * Get variable name(s) from an expression:
 * - No space: it's a variable → extract it: {{name}} → name
 * - Has space: first is helper, rest are args → extract args: {{add a b}} → a, b
 */
type ExtractVarFromExpr<S extends string> = S extends `${string} ${infer Rest}`
  ? ExtractHelperArgs<Rest> // Has space: extract arguments after helper name
  : FilterValidVar<S>; // No space: it's just a variable

/** Get the base variable name (first segment of a path) */
type BaseVar<S extends string> = S extends `${infer Base}.${string}` ? Base : S;

/** Extract all base variable names from a template */
type ExtractBaseVars<T extends string> = BaseVar<ExtractVarFromExpr<ExtractSingleVar<T>>>;

// ============================================================================
// {{#each}} Block Detection
// ============================================================================

/** Get first word (for array names in #each) */
type FirstWord<S extends string> = S extends `${infer Word} ${string}` ? Word : S;

/**
 * Extract the array variable from an #each expression
 * - Simple: {{#each items}} → items
 * - Subexpression: {{#each (filter items 'active')}} → skip (helper transforms data)
 *
 * For subexpressions, we can't reliably know if the input is an array or if
 * the helper transforms it into one, so we skip array inference for those cases.
 */
type ExtractArrayFromExpr<S extends string> =
  // Skip subexpressions - helper result is the array, not the input
  TrimContent<S> extends `(${string}`
    ? never
    : // Simple array reference
      FilterValidVar<TrimContent<FirstWord<S>>>;

/** Extract array name from {{#each arrayName}} */
type ExtractEachArray<S extends string> =
  S extends `${string}{{#each ${infer ArrayExpr}}}${string}{{/each}}${infer Rest}`
    ? ExtractArrayFromExpr<ArrayExpr> | ExtractEachArray<Rest>
    : never;

/** Extract content inside {{#each}} block */
type ExtractEachContent<S extends string> =
  S extends `${string}{{#each ${string}}}${infer Content}{{/each}}${infer Rest}`
    ? Content | ExtractEachContent<Rest>
    : never;

/** Get variables used inside {{#each}} blocks (these are array item properties) */
type EachItemVars<T extends string> = ExtractBaseVars<ExtractEachContent<T>>;

// ============================================================================
// {{#if}} Block Detection
// ============================================================================

/** Extract condition variable from {{#if condition}} */
type ExtractIfCondition<S extends string> =
  S extends `${string}{{#if ${infer Cond}}}${string}{{/if}}${infer Rest}`
    ? BaseVar<TrimContent<FirstWord<Cond>>> | ExtractIfCondition<Rest>
    : never;

// ============================================================================
// Type Building
// ============================================================================

/** Filter out empty strings and invalid keys */
type ValidKey<K> = K extends "" | never ? never : K;

/** Create object type from variable names */
type VarsToObject<V extends string> = {
  [K in V as ValidKey<K>]: unknown;
};

/** Create object type for array items (loose - allows extra properties) */
type ArrayItemType<V extends string> = [V] extends [never]
  ? unknown
  : Prettify<VarsToObject<V>> & Record<string, unknown>;

/** Create array type for {{#each}} variables */
type ArraysFromEach<T extends string> = {
  [K in ExtractEachArray<T>]: Array<ArrayItemType<EachItemVars<T>>>;
};

/** Get non-array variables (exclude those used in {{#each}}) */
type NonArrayVars<T extends string> = Exclude<
  ExtractBaseVars<T>,
  ExtractEachArray<T> | EachItemVars<T>
>;

// ============================================================================
// Main Type Inference
// ============================================================================

/**
 * Check if template uses subexpressions (helpers that transform data)
 * These are unreliable for inference since we can't understand transformer behavior
 */
type HasComplexTransformers<T extends string> = T extends `${string}{{#each (${string}}${string}`
  ? true
  : T extends `${string}{{#if (${string}}${string}`
    ? true
    : false;

/**
 * Infer the data type required by a Handlebars template.
 *
 * @template T - Template string literal type (use `as const`)
 * @returns Object type representing the expected data structure
 *
 * ⚠️ LIMITATIONS:
 * - If template uses partials ({{> ...}}), we infer what we can from the main template
 *   but cannot see variables inside partials. Use a schema for full type safety.
 * - Complex transformers (subexpressions) may not be fully understood
 * - Custom transformers registered at runtime are NOT visible to the type system
 *
 * 💡 For production code, prefer schemas:
 * ```ts
 * import { z } from 'zod';
 * const schema = z.object({ name: z.string() });
 * const weaver = new PromptWeaver(template, { schema });
 * ```
 *
 * @example
 * ```ts
 * // Simple variables
 * const t1 = `Hello {{name}}!` as const;
 * type D1 = InferTemplateData<typeof t1>;
 * // D1 = { name: unknown }
 *
 * // Arrays with {{#each}}
 * const t2 = `{{#each items}}{{title}}{{/each}}` as const;
 * type D2 = InferTemplateData<typeof t2>;
 * // D2 = { items: Array<{ title: unknown }> }
 *
 * // Mixed
 * const t3 = `{{user}} {{#each products}}{{name}}{{/each}}` as const;
 * type D3 = InferTemplateData<typeof t3>;
 * // D3 = { user: unknown; products: Array<{ name: unknown }> }
 *
 * // With partials - requires main template vars, allows extras for partials
 * const t4 = `{{> header}}{{content}}` as const;
 * type D4 = InferTemplateData<typeof t4>;
 * // D4 = { content: unknown } & Record<string, unknown>
 * // (requires 'content', allows additional fields like 'title' for partials)
 * ```
 */
/**
 * Base inferred type (strict - only what's visible in template)
 */
type InferredBase<T extends string> = Prettify<VarsToObject<NonArrayVars<T>> & ArraysFromEach<T>>;

/**
 * Loose type that requires template variables but allows additional properties.
 * This is important because:
 * - Partials may need variables not visible in the main template
 * - Custom transformers may need additional data
 * - Users should be able to pass extra data without type errors
 */
type LooseInferred<T extends string> = InferredBase<T> & Record<string, unknown>;

export type InferTemplateData<T extends string> =
  // If complex transformers detected, be conservative
  HasComplexTransformers<T> extends true
    ? Record<string, unknown>
    : // Always use loose inference - require main template vars, allow extras
      LooseInferred<T>;

/**
 * Extract just the variable names (top-level keys) from a template
 */
export type TemplateVariables<T extends string> = keyof InferTemplateData<T>;

/**
 * Extract array names from a template (variables used with {{#each}})
 */
export type TemplateArrays<T extends string> = ExtractEachArray<T>;

/**
 * Extract condition variables from a template (variables used with {{#if}})
 */
export type TemplateConditions<T extends string> = ExtractIfCondition<T>;

// ============================================================================
// Type-safe Template Creation Helper
// ============================================================================

/**
 * Create a typed template. The return type includes the inferred data type.
 *
 * @example
 * ```ts
 * const myTemplate = createTypedTemplate(`Hello {{name}}! {{#each items}}{{title}}{{/each}}`);
 * // myTemplate.template = the string
 * // myTemplate.DataType = { name: unknown; items: Array<{ title: unknown }> }
 *
 * // Use with PromptWeaver:
 * const weaver = new PromptWeaver(myTemplate.template);
 * // Now you know what data shape to provide
 * ```
 */
export function createTypedTemplate<T extends string>(
  template: T
): {
  template: T;
  /** The inferred data type (for reference, not runtime) */
  _dataType: InferTemplateData<T>;
} {
  return {
    template,
    _dataType: {} as InferTemplateData<T>,
  };
}

/**
 * Type-only helper to get the data type for a template
 * Use this when you just need the type, not a runtime value
 *
 * @example
 * ```ts
 * const template = `Hello {{name}}!` as const;
 * type MyData = TemplateDataType<typeof template>;
 * // MyData = { name: unknown }
 *
 * // Then use it:
 * function getData(): MyData {
 *   return { name: "World" };
 * }
 * ```
 */
export type TemplateDataType<T extends string> = InferTemplateData<T>;
