import Handlebars from "handlebars";

/**
 * Register array Handlebars helpers.
 */
export function registerArrayHelpers(): void {
  // Array helpers
  Handlebars.registerHelper("length", (array: unknown[] | string) => {
    if (Array.isArray(array)) return array.length;
    if (typeof array === "string") return array.length;
    return 0;
  });
}

