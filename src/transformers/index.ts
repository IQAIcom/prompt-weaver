import Handlebars from "handlebars";
import { TransformerRegistry } from "../core/plugin-system.js";
import { registerArithmeticHelpers } from "./arithmetic.js";
import { registerArrayHelpers } from "./array.js";
import { registerCollectionHelpers } from "./collection.js";
import { registerComparisonHelpers } from "./comparison.js";
import { registerConditionalHelpers } from "./conditional.js";
import { registerDateHelpers } from "./date.js";
import { formatters } from "./formatters.js";
import { registerLogicalHelpers } from "./logical.js";
import { registerObjectHelpers } from "./object.js";
import { registerStringHelpers } from "./string.js";
import { registerTemplateHelpers } from "./template.js";

let helpersRegistered = false;

/**
 * Register all custom template helpers.
 * This method registers formatters, arithmetic, comparison, array, logical,
 * string, date, object, collection, conditional, and template helpers.
 */
export function registerHandlebarsHelpers(): void {
  if (helpersRegistered) {
    return;
  }

  // Register each formatter as a template helper
  for (const [name, formatter] of Object.entries(formatters)) {
    Handlebars.registerHelper(name, formatter);
  }

  // Register all helper categories
  registerArithmeticHelpers();
  registerComparisonHelpers();
  registerArrayHelpers();
  registerLogicalHelpers();
  registerStringHelpers();
  registerDateHelpers();
  registerObjectHelpers();
  registerCollectionHelpers();
  registerConditionalHelpers();
  registerTemplateHelpers();

  helpersRegistered = true;
}

/**
 * Get the global transformer registry instance
 */
export function getGlobalRegistry(): TransformerRegistry {
  return TransformerRegistry.getGlobal();
}

/**
 * Register a custom transformer helper
 * @param name - Name of the helper
 * @param handler - The helper function
 * @param metadata - Optional metadata
 */
export function registerTransformer(
  name: string,
  handler: Parameters<TransformerRegistry["registerTransformer"]>[1],
  metadata?: Parameters<TransformerRegistry["registerTransformer"]>[2]
): void {
  const registry = TransformerRegistry.getGlobal();
  registry.registerTransformer(name, handler, metadata);
  // Immediately register the transformer
  Handlebars.registerHelper(name, handler);
}

// Re-export all transformers
export { formatters } from "./formatters.js";
export { registerArithmeticHelpers } from "./arithmetic.js";
export { registerComparisonHelpers } from "./comparison.js";
export { registerArrayHelpers } from "./array.js";
export { registerLogicalHelpers } from "./logical.js";
export { registerStringHelpers } from "./string.js";
export { registerDateHelpers } from "./date.js";
export { registerObjectHelpers } from "./object.js";
export { registerCollectionHelpers } from "./collection.js";
export { registerConditionalHelpers } from "./conditional.js";
export { registerTemplateHelpers } from "./template.js";
export { TransformerRegistry } from "../core/plugin-system.js";
