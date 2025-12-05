import Handlebars from "handlebars";

/**
 * Register template composition Handlebars helpers.
 */
export function registerTemplateHelpers(): void {
  // Template partials support (Handlebars already has built-in partial support,
  // but we can add helpers to make it easier)
  Handlebars.registerHelper(
    "partial",
    (name: string, context: unknown, options: Handlebars.HelperOptions) => {
      // Handlebars partials are registered via Handlebars.registerPartial()
      // This helper provides a programmatic way to render partials
      const partial = Handlebars.partials[name];
      if (typeof partial === "function") {
        return partial(context || options.data?.root || {});
      }
      if (typeof partial === "string") {
        const compiled = Handlebars.compile(partial);
        return compiled(context || options.data?.root || {});
      }
      return "";
    }
  );

  // Template inclusion (similar to partial but with explicit context)
  Handlebars.registerHelper(
    "include",
    (name: string, context: unknown, options: Handlebars.HelperOptions) => {
      const partial = Handlebars.partials[name];
      const ctx = context || options.data?.root || {};
      if (typeof partial === "function") {
        return partial(ctx);
      }
      if (typeof partial === "string") {
        const compiled = Handlebars.compile(partial);
        return compiled(ctx);
      }
      return "";
    }
  );

  // Named blocks (for template inheritance patterns)
  Handlebars.registerHelper(
    "block",
    function (this: unknown, name: string, options: Handlebars.HelperOptions) {
      // Store block content in options.data
      if (options.data) {
        if (!options.data.blocks) {
          options.data.blocks = {};
        }
        options.data.blocks[name] = options.fn(this);
      }
      return options.fn(this);
    }
  );

  // Block rendering
  Handlebars.registerHelper("yield", (name: string, options: Handlebars.HelperOptions) => {
    if (options.data?.blocks?.[name]) {
      return options.data.blocks[name];
    }
    return "";
  });
}
