import Handlebars from "handlebars";

/**
 * Register logical Handlebars helpers.
 */
export function registerLogicalHelpers(): void {
  // Logical helpers
  Handlebars.registerHelper("and", (...args: unknown[]) => {
    // Last arg is the options object, exclude it
    const values = args.slice(0, -1);
    return values.every((v) => Boolean(v));
  });

  Handlebars.registerHelper("or", (...args: unknown[]) => {
    // Last arg is the options object, exclude it
    const values = args.slice(0, -1);
    return values.some((v) => Boolean(v));
  });
}

