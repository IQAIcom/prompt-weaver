import Handlebars from "handlebars";

/**
 * Register arithmetic Handlebars helpers.
 */
export function registerArithmeticHelpers(): void {
  // Register a helper to increment a number by 1 (for 1-based indexing)
  Handlebars.registerHelper("increment", (value: number) => {
    return Number(value) + 1;
  });

  // Math helpers
  Handlebars.registerHelper("add", (a: number, b: number) => {
    return Number(a) + Number(b);
  });

  Handlebars.registerHelper("multiply", (a: number, b: number) => {
    return Number(a) * Number(b);
  });

  Handlebars.registerHelper("divide", (a: number, b: number) => {
    const divisor = Number(b);
    return divisor !== 0 ? Number(a) / divisor : 0;
  });

  Handlebars.registerHelper("subtract", (a: number, b: number) => {
    return Number(a) - Number(b);
  });
}

