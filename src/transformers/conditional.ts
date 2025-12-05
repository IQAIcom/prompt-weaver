import Handlebars from "handlebars";

/**
 * Register enhanced conditional logic Handlebars helpers.
 */
export function registerConditionalHelpers(): void {
  // Enhanced conditionals
  Handlebars.registerHelper("ifElse", (condition: unknown, ifTrue: unknown, ifFalse: unknown) => {
    return condition ? ifTrue : ifFalse;
  });

  // Switch/case logic
  Handlebars.registerHelper(
    "switch",
    function (this: unknown, value: unknown, options: Handlebars.HelperOptions) {
      // This is a block helper that works with {{#case}} helpers
      // Store the value in options.data for case helpers to access
      if (options.data) {
        options.data.switchValue = value;
      }
      return options.fn(this);
    }
  );

  Handlebars.registerHelper(
    "case",
    function (this: unknown, value: unknown, options: Handlebars.HelperOptions) {
      const switchValue = options.data?.switchValue;
      if (switchValue === value) {
        return options.fn(this);
      }
      return "";
    }
  );

  // Null/undefined handling
  Handlebars.registerHelper("coalesce", (...values: unknown[]) => {
    // Last arg is options object, exclude it
    const actualValues = values.slice(0, -1);
    for (const value of actualValues) {
      if (value !== null && value !== undefined && value !== "") {
        return value;
      }
    }
    return "";
  });

  Handlebars.registerHelper("default", (value: unknown, defaultValue: unknown) => {
    if (value === null || value === undefined || value === "") {
      return defaultValue;
    }
    return value;
  });

  // Value existence checks
  Handlebars.registerHelper("exists", (value: unknown) => {
    return value !== null && value !== undefined;
  });

  Handlebars.registerHelper("isDefined", (value: unknown) => {
    return value !== undefined;
  });
}
