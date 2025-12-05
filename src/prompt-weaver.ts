import type { StandardSchemaV1 } from "@standard-schema/spec";
import Handlebars, { type TemplateDelegate } from "handlebars";
import type { TemplateHelper, TransformerRegistry } from "./core/plugin-system.js";
import {
  SchemaValidationError,
  type SchemaValidationResult,
  isStandardSchema,
  parseWithSchema,
  parseWithSchemaAsync,
  validateWithSchema,
  validateWithSchemaAsync,
} from "./schema-validation.js";
import {
  getGlobalRegistry,
  registerHandlebarsHelpers,
  registerTransformer,
} from "./transformers/index.js";
import { extractVariables, validateTemplate } from "./validation.js";

/**
 * Options for configuring PromptWeaver instance
 */
export interface PromptWeaverOptions<TSchema extends StandardSchemaV1 = StandardSchemaV1> {
  /** Custom transformers to register */
  transformers?: Array<{
    name: string;
    handler: TemplateHelper;
    metadata?: { description?: string; dependencies?: string[]; version?: string };
  }>;
  /** Additional template helpers to register */
  helpers?: Record<string, TemplateHelper>;
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
 * Template engine for rendering Prompt Weaver templates.
 * Provides a clean API for building and rendering prompts with a powerful template system.
 *
 * @template TData - Type of the data object expected by the template
 *
 * @example
 * ```ts
 * import promptTemplate from './trading-prompt.hbs';
 * const engine = new PromptWeaver(promptTemplate);
 * const output = engine.format({ name: "World", value: 100 });
 * ```
 *
 * @example
 * ```ts
 * interface MyData {
 *   name: string;
 *   value: number;
 * }
 * const engine = new PromptWeaver<MyData>(template, {
 *   strict: true,
 *   throwOnMissing: true,
 * });
 * const output = engine.format({ name: "World", value: 100 });
 * ```
 */
export class PromptWeaver<
  TData extends Record<string, unknown> = Record<string, unknown>,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
> {
  private readonly template: TemplateDelegate;
  private readonly templateSource: string;
  private readonly options: Pick<PromptWeaverOptions, "registry" | "schema">;
  private readonly registry: TransformerRegistry;
  private readonly schema?: TSchema;

  /**
   * Format the template with the provided data.
   * @param data - Data object to render in the template
   * @returns Rendered template string
   *
   * @remarks
   * For data validation, use {@link formatWithSchema} with a Standard Schema validator.
   */
  format(data: TData): string {
    return this.template(data);
  }

  /**
   * Create a new template engine instance.
   * @param templateSource - Template source string or imported template module
   * @param options - Configuration options
   */
  constructor(
    templateSource: string | { default?: string },
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

    // Register custom transformers
    if (options.transformers) {
      for (const transformer of options.transformers) {
        registerTransformer(transformer.name, transformer.handler, transformer.metadata);
      }
    }

    // Register additional helpers
    if (options.helpers) {
      for (const [name, handler] of Object.entries(options.helpers)) {
        Handlebars.registerHelper(name, handler);
      }
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
   * @param templateSource - The template source code as a string
   * @returns A compiled template function
   */
  private compileHandlebarsTemplate(templateSource: string): TemplateDelegate {
    // Compile the template
    return Handlebars.compile(templateSource);
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
   */
  static composeAndCreate<TSchema extends StandardSchemaV1 = StandardSchemaV1>(
    templateSources: string[],
    options?: PromptWeaverOptions<TSchema>
  ): PromptWeaver<Record<string, unknown>, TSchema> {
    const composed = PromptWeaver.compose(templateSources);
    return new PromptWeaver(composed, options);
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
   * @param name - Name of the partial
   * @param templateSource - Partial template source
   */
  setPartial(name: string, templateSource: string): void {
    Handlebars.registerPartial(name, templateSource);
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
   * Check if a schema is configured for this instance
   */
  hasSchema(): boolean {
    return this.schema !== undefined;
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
   * Get the configured schema vendor name
   * @returns The vendor name or undefined if no schema is configured
   */
  getSchemaVendor(): string | undefined {
    return this.schema?.["~standard"].vendor;
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

  /**
   * Format template with schema validation
   * Validates data against the configured schema before rendering
   *
   * @param data - Data to validate and render (type-safe when schema is provided)
   * @returns Rendered template string
   * @throws {SchemaValidationError} If schema validation fails
   * @throws Error if no schema is configured
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
   *
   * // This will validate data before rendering with full type inference
   * const output = engine.formatWithSchema({ name: 'Test', count: 5 });
   * ```
   */
  formatWithSchema(data: StandardSchemaV1.InferInput<TSchema>): string {
    const schema = this._ensureSchema();

    // Validate and parse data with schema
    const validatedData = parseWithSchema(schema, data);

    return this.template(validatedData);
  }

  /**
   * Format template with schema validation (async)
   * Validates data against the configured schema before rendering
   *
   * @param data - Data to validate and render (type-safe when schema is provided)
   * @returns Promise resolving to rendered template string
   * @throws {SchemaValidationError} If schema validation fails
   * @throws Error if no schema is configured
   */
  async formatWithSchemaAsync(data: StandardSchemaV1.InferInput<TSchema>): Promise<string> {
    const schema = this._ensureSchema();

    // Validate and parse data with schema
    const validatedData = await parseWithSchemaAsync(schema, data);

    return this.template(validatedData);
  }

  /**
   * Try to format template with schema validation, returning null on failure
   *
   * @param data - Data to validate and render (type-safe when schema is provided)
   * @returns Rendered template string or null if validation fails
   *
   * @example
   * ```ts
   * const output = engine.tryFormatWithSchema(userInput);
   * if (output === null) {
   *   console.log('Invalid input');
   * }
   * ```
   */
  tryFormatWithSchema(data: StandardSchemaV1.InferInput<TSchema>): string | null {
    try {
      return this.formatWithSchema(data);
    } catch (error) {
      // Only swallow validation errors. Re-throw configuration or other errors.
      if (error instanceof SchemaValidationError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a type-safe formatter function bound to the schema
   * Useful for creating reusable formatters with proper type inference
   *
   * @returns A function that validates and formats data
   *
   * @example
   * ```ts
   * import { z } from 'zod';
   *
   * const schema = z.object({
   *   name: z.string(),
   *   items: z.array(z.string()),
   * });
   *
   * const engine = new PromptWeaver(template, { schema });
   * const formatter = engine.createSchemaFormatter();
   *
   * // formatter is now a typed function
   * const output = formatter({ name: 'Test', items: ['a', 'b'] });
   * ```
   */
  createSchemaFormatter(): (data: StandardSchemaV1.InferInput<TSchema>) => string {
    return (data: StandardSchemaV1.InferInput<TSchema>) => this.formatWithSchema(data);
  }
}
