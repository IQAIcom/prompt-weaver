import type Handlebars from "handlebars";

/**
 * Type definition for a template helper function.
 * This is the public-facing type that hides the underlying Handlebars implementation.
 */
export type TemplateHelper = Handlebars.HelperDelegate;

/**
 * Configuration for a transformer plugin
 */
export interface TransformerConfig {
  /** Name of the transformer */
  name: string;
  /** The helper function to register */
  handler: TemplateHelper;
  /** Optional metadata about the transformer */
  metadata?: {
    description?: string;
    dependencies?: string[];
    version?: string;
  };
}

/**
 * Registry for managing custom transformers and template helpers.
 * Supports both global and scoped (per-instance) transformer registration.
 */
export class TransformerRegistry {
  private static globalRegistry: TransformerRegistry | null = null;
  private transformers: Map<string, TransformerConfig> = new Map();
  private registeredHelpers: Set<string> = new Set();

  /**
   * Get or create the global transformer registry instance
   */
  static getGlobal(): TransformerRegistry {
    if (!TransformerRegistry.globalRegistry) {
      TransformerRegistry.globalRegistry = new TransformerRegistry();
    }
    return TransformerRegistry.globalRegistry;
  }

  /**
   * Create a new scoped transformer registry instance
   */
  static createScoped(): TransformerRegistry {
    return new TransformerRegistry();
  }

  /**
   * Register a transformer helper
   * @param name - Name of the helper
   * @param handler - The helper function
   * @param metadata - Optional metadata
   */
  registerTransformer(
    name: string,
    handler: TemplateHelper,
    metadata?: TransformerConfig["metadata"]
  ): void {
    // Note: Transformer overwriting is allowed, previous registration will be replaced
    // Users should be aware of this behavior

    this.transformers.set(name, {
      name,
      handler,
      metadata,
    });
  }

  /**
   * Register multiple transformers at once
   * @param transformers - Record of name -> handler mappings
   */
  registerTransformers(transformers: Record<string, TemplateHelper>): void {
    for (const [name, handler] of Object.entries(transformers)) {
      this.registerTransformer(name, handler);
    }
  }

  /**
   * Register all transformers with Handlebars
   * @param handlebars - Handlebars instance to register with
   */
  registerWithHandlebars(handlebars: typeof Handlebars): void {
    for (const [name, config] of this.transformers.entries()) {
      if (!this.registeredHelpers.has(name)) {
        handlebars.registerHelper(name, config.handler);
        this.registeredHelpers.add(name);
      }
    }
  }

  /**
   * Get a transformer by name
   * @param name - Name of the transformer
   * @returns The transformer config or undefined
   */
  getTransformer(name: string): TransformerConfig | undefined {
    return this.transformers.get(name);
  }

  /**
   * Check if a transformer is registered
   * @param name - Name of the transformer
   * @returns True if registered
   */
  hasTransformer(name: string): boolean {
    return this.transformers.has(name);
  }

  /**
   * Get all registered transformer names
   * @returns Array of transformer names
   */
  getTransformerNames(): string[] {
    return Array.from(this.transformers.keys());
  }

  /**
   * Clear all registered transformers
   */
  clear(): void {
    this.transformers.clear();
    this.registeredHelpers.clear();
  }
}
