import type { StandardSchemaV1 } from "@standard-schema/spec";
import Handlebars, { type TemplateDelegate } from "handlebars";
import { getGlobalRegistry, registerHandlebarsHelpers } from "../transformers/index.js";
import type { InferTemplateData } from "../types/template-inference.js";
import {
  isStandardSchema,
  parseWithSchema,
  parseWithSchemaAsync,
  type SchemaValidationResult,
  validateWithSchema,
  validateWithSchemaAsync,
} from "../validation/schema-validation.js";
import { extractVariables, validateTemplate } from "../validation/template-validation.js";
import type { TransformerRegistry } from "./plugin-system.js";

/**
 * Simple hash function for template source strings
 */
function hashTemplateSource(source: string): string {
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Template compilation cache
 */
class TemplateCache {
  private cache = new Map<string, TemplateDelegate>();

  get(source: string): TemplateDelegate | undefined {
    const key = hashTemplateSource(source);
    return this.cache.get(key);
  }

  set(source: string, compiled: TemplateDelegate): void {
    const key = hashTemplateSource(source);
    this.cache.set(key, compiled);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global template cache (shared across all instances)
const globalTemplateCache = new TemplateCache();

/**
 * Options for configuring PromptWeaver instance
 */
export interface PromptWeaverOptions<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
  /** Custom transformer registry (defaults to global) */
  registry?: TransformerRegistry;
  /** Partial templates to register */
  partials?: Record<string, string>;
  /**
   * Standard Schema compatible validator for data validation
   * @see https://standardschema.dev
   *
   * Works with Zod 3.24+, Valibot 1.0+, ArkType 2.0+, and other spec-compliant libraries.
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const schema = z.object({
   *   name: z.string(),
   *   count: z.number().positive(),
   * });
   *
   * const engine = new PromptWeaver(template, { schema });
   * ```
   */
  schema?: TSchema;
  /**
   * Enable template compilation caching for better performance when reusing templates.
   * Defaults to true. Set to false to disable caching.
   */
  enableCache?: boolean;
}

/**
 * Template metadata extracted from the template
 */
export interface TemplateMetadata {
  /** Variables used in the template */
  variables: string[];
  /** Helpers used in the template */
  helpers: string[];
  /** Partials referenced in the template */
  partials: string[];
}

/**
 * Helper type to infer data type.
 * Priority:
 * 1. If schema provides a concrete type (has keys), use it
 * 2. If template is a literal string, use InferTemplateData
 * 3. Otherwise, fall back to Record<string, unknown>
 */
type InferData<
  TTemplate extends string,
  TSchema extends StandardSchemaV1,
> = // Check if schema provides useful type info (has at least one key)
keyof StandardSchemaV1.InferInput<TSchema> extends never
  ? // No schema type info - try template inference
    string extends TTemplate
    ? Record<string, unknown> // Template is generic string, no inference possible
    : InferTemplateData<TTemplate> // Use template inference
  : // Schema provides type info - use it
    StandardSchemaV1.InferInput<TSchema> extends Record<string, unknown>
    ? StandardSchemaV1.InferInput<TSchema>
    : Record<string, unknown>;

/**
 * Template engine for rendering Prompt Weaver templates.
 * Provides a clean API for building and rendering prompts with a powerful template system.
 *
 * Type inference is automatic:
 * - With schema: `format()` requires the schema's input type
 * - Without schema: `format()` infers types from template (use `as const`)
 *
 * @template TTemplate - The template string literal type (for automatic inference)
 * @template TSchema - Standard Schema validator type
 * @template TData - Type of the data object (auto-inferred from template or schema)
 *
 * @example
 * ```ts
 * // Automatic type inference from template (use `as const`)
 * const template = `Hello {{name}}! You have {{count}} items.` as const;
 * const engine = new PromptWeaver(template);
 * // format() infers: { name: unknown; count: unknown }
 * engine.format({ name: "Alice", count: 5 });
 * ```
 *
 * @example
 * ```ts
 * // Array inference from {{#each}}
 * const template = `{{#each items}}{{title}}{{/each}}` as const;
 * const engine = new PromptWeaver(template);
 * // format() infers: { items: Array<{ title: unknown }> }
 * engine.format({ items: [{ title: "Item 1" }] });
 * ```
 *
 * @example
 * ```ts
 * // With schema for specific types + runtime validation
 * import { z } from 'zod';
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number(),
 * });
 * const engine = new PromptWeaver(template, { schema });
 * // format() requires { name: string; age: number }
 * engine.format({ name: "World", age: 30 });
 * ```
 */
export class PromptWeaver<
  TTemplate extends string = string,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TData extends Record<string, unknown> = InferData<TTemplate, TSchema>,
> {
  private readonly template: TemplateDelegate;
  private readonly templateSource: string;
  private readonly options: Pick<PromptWeaverOptions, "registry" | "schema" | "enableCache">;
  private readonly registry: TransformerRegistry;
  private readonly schema?: TSchema;

  /**
   * Format the template with the provided data.
   * When a schema is provided, this method automatically validates the data against the schema before rendering.
   * Type inference ensures type safety at compile time, and runtime validation ensures data correctness.
   *
   * @param data - Data object to render in the template (type-safe when schema is provided)
   * @returns Rendered template string
   * @throws {SchemaValidationError} If schema validation fails (when schema is provided)
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const schema = z.object({
   *   name: z.string(),
   *   age: z.number(),
   * });
   *
   * const engine = new PromptWeaver(template, { schema });
   * // format() automatically validates and requires correct types
   * const output = engine.format({ name: 'John', age: 30 });
   * ```
   */
  format(data: TData): string {
    // If schema is provided, validate the data before rendering
    if (this.schema) {
      const validatedData = parseWithSchema(this.schema, data);
      return this.template(validatedData);
    }
    // No schema, render directly
    return this.template(data);
  }

  /**
   * Format the template with the provided data asynchronously.
   * When a schema is provided, this method automatically validates the data against the schema before rendering.
   * Use this method when your schema includes async validations (e.g., Zod refinements with async checks).
   * Type inference ensures type safety at compile time, and runtime validation ensures data correctness.
   *
   * @param data - Data object to render in the template (type-safe when schema is provided)
   * @returns Promise resolving to rendered template string
   * @throws {SchemaValidationError} If schema validation fails (when schema is provided)
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const schema = z.object({
   *   email: z.string().email().refine(async (email) => {
   *     // Async validation (e.g., check if email exists in database)
   *     return await checkEmailExists(email);
   *   }),
   *   name: z.string(),
   * });
   *
   * const engine = new PromptWeaver(template, { schema });
   * // formatAsync() handles async validation automatically
   * const output = await engine.formatAsync({ email: 'john@example.com', name: 'John' });
   * ```
   */
  async formatAsync(data: TData): Promise<string> {
    // If schema is provided, validate the data asynchronously before rendering
    if (this.schema) {
      const validatedData = await parseWithSchemaAsync(this.schema, data);
      return this.template(validatedData);
    }
    // No schema, render directly (still return Promise for consistency)
    return Promise.resolve(this.template(data));
  }

  /**
   * Create a new template engine instance.
   * @param templateSource - Template source string (use `as const` for type inference) or imported template module
   * @param options - Configuration options
   */
  constructor(
    templateSource: TTemplate | { default?: string },
    options: PromptWeaverOptions<TSchema> = {}
  ) {
    // Handle both direct string imports and module imports (from webpack/vite)
    const source =
      typeof templateSource === "string" ? templateSource : (templateSource?.default ?? "");

    if (!source) {
      throw new Error("Template source is empty. Ensure the template is properly imported.");
    }

    this.templateSource = source;
    this.options = {
      registry: options.registry,
      schema: options.schema,
      enableCache: options.enableCache !== false, // Default to true
    };

    // Store schema for validation
    if (options.schema) {
      if (!isStandardSchema(options.schema)) {
        throw new Error(
          "Invalid schema: expected a Standard Schema compatible validator. " +
            "Ensure you're using a compatible library (Zod 3.24+, Valibot 1.0+, ArkType 2.0+, etc.)"
        );
      }
      this.schema = options.schema;
    }

    // Use provided registry or global registry
    this.registry = this.options.registry || getGlobalRegistry();

    // Ensure helpers are registered
    registerHandlebarsHelpers();

    // Register transformers from scoped registry with Handlebars
    // Global registry transformers are already registered via registerTransformer()
    // but scoped registries need explicit registration
    if (this.options.registry) {
      this.registry.registerWithHandlebars(Handlebars);
    }

    // Register partials
    if (options.partials) {
      for (const [name, partialSource] of Object.entries(options.partials)) {
        this.setPartial(name, partialSource);
      }
    }

    // Validate template syntax
    const templateValidation = validateTemplate(source);
    if (!templateValidation.valid && templateValidation.errors.length > 0) {
      const error = templateValidation.errors[0];
      throw new Error(`Template validation failed: ${error.getFormattedMessage()}`);
    }

    this.template = this.compileHandlebarsTemplate(source);
  }

  /**
   * Compile a template from source string.
   * This method ensures helpers are registered and returns a compiled template function.
   * Uses caching if enabled to avoid recompiling identical templates.
   * @param templateSource - The template source code as a string
   * @returns A compiled template function
   */
  private compileHandlebarsTemplate(templateSource: string): TemplateDelegate {
    // Check cache if enabled
    if (this.options.enableCache) {
      const cached = globalTemplateCache.get(templateSource);
      if (cached) {
        return cached;
      }
    }

    // Compile the template
    const compiled = Handlebars.compile(templateSource);

    // Cache if enabled
    if (this.options.enableCache) {
      globalTemplateCache.set(templateSource, compiled);
    }

    return compiled;
  }

  /**
   * Clear the global template compilation cache.
   * Useful for freeing memory or forcing recompilation of all templates.
   */
  static clearTemplateCache(): void {
    globalTemplateCache.clear();
  }

  /**
   * Get the size of the global template compilation cache.
   * @returns Number of cached templates
   */
  static getTemplateCacheSize(): number {
    return globalTemplateCache.size();
  }

  /**
   * Compose multiple template sources together
   * @param templateSources - Array of template source strings
   * @param separator - Optional separator between templates
   * @returns Composed template string
   */
  static compose(templateSources: string[], separator = "\n\n"): string {
    return templateSources.join(separator);
  }

  /**
   * Create a new PromptWeaver from composed templates
   * @param templateSources - Array of template source strings
   * @param options - Options for the new PromptWeaver instance
   * @returns New PromptWeaver instance with proper type inference from schema
   *
   * Note: Since templates are composed at runtime, automatic type inference
   * from the template is not available. Use a schema for type safety.
   */
  static composeAndCreate<TSchema extends StandardSchemaV1 = StandardSchemaV1>(
    templateSources: string[],
    options?: PromptWeaverOptions<TSchema>
  ): PromptWeaver<string, TSchema> {
    const composed = PromptWeaver.compose(templateSources);
    return new PromptWeaver<string, TSchema>(composed, options);
  }

  /**
   * Extract required variables from the template
   * @returns Set of variable names
   */
  extractVariables(): Set<string> {
    return extractVariables(this.templateSource);
  }

  /**
   * Register a partial template
   * Partials are pre-compiled for better performance, avoiding on-the-fly compilation.
   * @param name - Name of the partial
   * @param templateSource - Partial template source
   */
  setPartial(name: string, templateSource: string): void {
    // Pre-compile the partial so Handlebars stores it as a function
    // This avoids on-the-fly compilation in the partial/include helpers
    const compiled = this.compileHandlebarsTemplate(templateSource);
    Handlebars.registerPartial(name, compiled);
  }

  /**
   * Get template metadata
   * @returns Template metadata including variables, helpers, and partials
   */
  getMetadata(): TemplateMetadata {
    const variables = Array.from(extractVariables(this.templateSource));
    const helpers: string[] = [];
    const partials: string[] = [];

    // Extract helpers from template (basic pattern matching)
    const helperRegex = /\{\{([#/^]?)(\w+)/g;
    let match: RegExpExecArray | null = null;
    // biome-ignore lint/suspicious/noAssignInExpressions: regex.exec pattern requires assignment
    while ((match = helperRegex.exec(this.templateSource)) !== null) {
      const helperName = match[2];
      if (helperName && helperName !== "if" && helperName !== "each" && helperName !== "with") {
        helpers.push(helperName);
      }
    }

    // Extract partial references
    const partialRegex = /\{\{>\s*(\w+)/g;
    match = null;
    // biome-ignore lint/suspicious/noAssignInExpressions: regex.exec pattern requires assignment
    while ((match = partialRegex.exec(this.templateSource)) !== null) {
      partials.push(match[1]);
    }

    return {
      variables: Array.from(new Set(variables)),
      helpers: Array.from(new Set(helpers)),
      partials: Array.from(new Set(partials)),
    };
  }

  /**
   * Ensure schema is configured, throwing an error if not
   * @private
   * @returns The configured schema
   * @throws Error if no schema is configured
   */
  private _ensureSchema(): TSchema {
    if (!this.schema) {
      throw new Error(
        "No schema configured. Pass a Standard Schema compatible validator in options."
      );
    }
    return this.schema;
  }

  /**
   * Validate data against the configured Standard Schema
   * @param data - Data to validate
   * @returns Validation result
   * @throws Error if no schema is configured
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const schema = z.object({
   *   name: z.string(),
   *   count: z.number(),
   * });
   *
   * const engine = new PromptWeaver(template, { schema });
   * const result = engine.validateSchema({ name: 'Test', count: 5 });
   *
   * if (result.success) {
   *   console.log(result.data);
   * } else {
   *   console.error(result.issues);
   * }
   * ```
   */
  validateSchema(data: unknown): SchemaValidationResult<StandardSchemaV1.InferOutput<TSchema>> {
    const schema = this._ensureSchema();
    return validateWithSchema(schema, data);
  }

  /**
   * Validate data against the configured Standard Schema (async)
   * @param data - Data to validate
   * @returns Promise resolving to validation result
   * @throws Error if no schema is configured
   */
  async validateSchemaAsync(
    data: unknown
  ): Promise<SchemaValidationResult<StandardSchemaV1.InferOutput<TSchema>>> {
    const schema = this._ensureSchema();
    return validateWithSchemaAsync(schema, data);
  }
}
