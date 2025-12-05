import Handlebars, { type TemplateDelegate } from "handlebars";
import type { TemplateHelper, TransformerRegistry } from "./core/plugin-system.js";
import {
  getGlobalRegistry,
  registerHandlebarsHelpers,
  registerTransformer,
} from "./transformers/index.js";
import {
  type ValidationError,
  extractVariables,
  validateData,
  validateTemplate,
} from "./validation.js";

/**
 * Options for configuring PromptWeaver instance
 */
export interface PromptWeaverOptions {
  /** Custom transformers to register */
  transformers?: Array<{
    name: string;
    handler: TemplateHelper;
    metadata?: { description?: string; dependencies?: string[]; version?: string };
  }>;
  /** Enable strict mode (warn about extra variables) */
  strict?: boolean;
  /** Throw error on missing required variables */
  throwOnMissing?: boolean;
  /** Additional template helpers to register */
  helpers?: Record<string, TemplateHelper>;
  /** Custom transformer registry (defaults to global) */
  registry?: TransformerRegistry;
  /** Partial templates to register */
  partials?: Record<string, string>;
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
export class PromptWeaver<TData extends Record<string, unknown> = Record<string, unknown>> {
  private readonly template: TemplateDelegate;
  private readonly templateSource: string;
  private readonly options: Required<Pick<PromptWeaverOptions, "strict" | "throwOnMissing">> &
    Pick<PromptWeaverOptions, "registry">;
  private readonly registry: TransformerRegistry;

  /**
   * Format the template with the provided data.
   * @param data - Data object to render in the template
   * @returns Rendered template string
   */
  format(data: TData): string {
    // Validate data if throwOnMissing is enabled
    if (this.options.throwOnMissing) {
      const validation = validateData(this.templateSource, data, {
        strict: this.options.strict,
        throwOnMissing: true,
      });
      if (!validation.valid && validation.errors.length > 0) {
        throw validation.errors[0];
      }
    }

    return this.template(data);
  }

  /**
   * Create a new template engine instance.
   * @param templateSource - Template source string or imported template module
   * @param options - Configuration options
   */
  constructor(templateSource: string | { default?: string }, options: PromptWeaverOptions = {}) {
    // Handle both direct string imports and module imports (from webpack/vite)
    const source =
      typeof templateSource === "string" ? templateSource : (templateSource?.default ?? "");

    if (!source) {
      throw new Error("Template source is empty. Ensure the template is properly imported.");
    }

    this.templateSource = source;
    this.options = {
      strict: options.strict ?? false,
      throwOnMissing: options.throwOnMissing ?? false,
      registry: options.registry,
    };

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
   * @returns New PromptWeaver instance
   */
  static composeAndCreate(templateSources: string[], options?: PromptWeaverOptions): PromptWeaver {
    const composed = PromptWeaver.compose(templateSources);
    return new PromptWeaver(composed, options);
  }

  /**
   * Validate data against template requirements
   * @param data - Data object to validate
   * @returns Validation result
   */
  validate(data: Partial<TData>): {
    valid: boolean;
    errors: ValidationError[];
    missing: string[];
    extra: string[];
  } {
    return validateData(this.templateSource, data, {
      strict: this.options.strict,
      throwOnMissing: false,
    });
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
}
