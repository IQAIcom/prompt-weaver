import Handlebars from "handlebars";
import { formatters } from "./formatters.js";
import { registerArithmeticHelpers } from "./arithmetic.js";
import { registerComparisonHelpers } from "./comparison.js";
import { registerArrayHelpers } from "./array.js";
import { registerLogicalHelpers } from "./logical.js";

/**
 * Register all custom Handlebars helpers.
 * This method registers formatters, arithmetic, comparison, array, and logical helpers.
 */
export function registerHandlebarsHelpers(): void {
  // Register each formatter as a Handlebars helper
  for (const [name, formatter] of Object.entries(formatters)) {
    Handlebars.registerHelper(name, formatter);
  }

  // Register all helper categories
  registerArithmeticHelpers();
  registerComparisonHelpers();
  registerArrayHelpers();
  registerLogicalHelpers();
}

// Re-export all transformers
export { formatters } from "./formatters.js";
export { registerArithmeticHelpers } from "./arithmetic.js";
export { registerComparisonHelpers } from "./comparison.js";
export { registerArrayHelpers } from "./array.js";
export { registerLogicalHelpers } from "./logical.js";

