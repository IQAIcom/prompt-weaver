import Handlebars from "handlebars";

/**
 * Register comparison Handlebars helpers.
 */
export function registerComparisonHelpers(): void {
  // Comparison helpers
  Handlebars.registerHelper("eq", (a: unknown, b: unknown) => {
    return a === b;
  });

  Handlebars.registerHelper("ne", (a: unknown, b: unknown) => {
    return a !== b;
  });

  Handlebars.registerHelper("gt", (a: number, b: number) => {
    return Number(a) > Number(b);
  });

  Handlebars.registerHelper("gte", (a: number, b: number) => {
    return Number(a) >= Number(b);
  });

  Handlebars.registerHelper("lt", (a: number, b: number) => {
    return Number(a) < Number(b);
  });

  Handlebars.registerHelper("lte", (a: number, b: number) => {
    return Number(a) <= Number(b);
  });
}
