import Handlebars, { type TemplateDelegate } from "handlebars";
import { registerHandlebarsHelpers } from "./transformers/index.js";

/**
 * Template engine for rendering Handlebars templates.
 * Provides a clean API that hides Handlebars implementation details.
 *
 * @example
 * ```ts
 * import promptTemplate from './trading-prompt.hbs';
 * const engine = new PromptWeaver(promptTemplate);
 * const output = engine.format({ name: "World", value: 100 });
 * ```
 */
export class PromptWeaver {
  private readonly template: TemplateDelegate;

  /**
   * Format the template with the provided data.
   * @param data - Data object to render in the template
   * @returns Rendered template string
   */
  format<T extends Record<string, unknown>>(data: T): string {
    return this.template(data);
  }

  /**
   * Create a new template engine instance.
   * @param templateSource - Template source string or imported template module
   */
  constructor(templateSource: string | { default?: string }) {
    // Handle both direct string imports and module imports (from webpack/vite)
    const source =
      typeof templateSource === "string" ? templateSource : (templateSource?.default ?? "");

    if (!source) {
      throw new Error("Template source is empty. Ensure the template is properly imported.");
    }

    this.template = this.compileHandlebarsTemplate(source);
  }

  /**
   * Compile a Handlebars template from source string.
   * This method ensures helpers are registered and returns a compiled Handlebars template.
   * @param templateSource - The Handlebars template source code as a string
   * @returns A compiled Handlebars template function
   */
  private compileHandlebarsTemplate(templateSource: string): TemplateDelegate {
    // Ensure helpers are registered
    registerHandlebarsHelpers();

    // Compile the template
    return Handlebars.compile(templateSource);
  }
}
