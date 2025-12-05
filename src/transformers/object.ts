import Handlebars from "handlebars";

/**
 * Register object/data manipulation Handlebars helpers.
 */
export function registerObjectHelpers(): void {
  // Object access
  Handlebars.registerHelper("get", (obj: Record<string, unknown>, key: string) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
    return obj[key];
  });

  Handlebars.registerHelper("has", (obj: Record<string, unknown>, key: string) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    return key in obj;
  });

  Handlebars.registerHelper("keys", (obj: Record<string, unknown>) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.keys(obj);
  });

  Handlebars.registerHelper("values", (obj: Record<string, unknown>) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
    return Object.values(obj);
  });

  // Object filtering
  Handlebars.registerHelper("pick", (obj: Record<string, unknown>, ...args: unknown[]) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const result: Record<string, unknown> = {};
    // Last arg is options object, exclude it
    const keys = args.slice(0, -1) as string[];
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  });

  Handlebars.registerHelper("omit", (obj: Record<string, unknown>, ...args: unknown[]) => {
    // Exclude arrays and null
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    const result: Record<string, unknown> = { ...obj };
    // Last arg is options object, exclude it
    const keys = args.slice(0, -1) as string[];
    for (const key of keys) {
      delete result[key];
    }
    return result;
  });

  // Object merging
  Handlebars.registerHelper("merge", (...args: unknown[]) => {
    // Last arg is options object, exclude it
    const objects = args.slice(0, -1) as Record<string, unknown>[];
    return Object.assign({}, ...objects);
  });

  Handlebars.registerHelper(
    "defaults",
    (obj: Record<string, unknown>, defaults: Record<string, unknown>) => {
      return { ...defaults, ...obj };
    }
  );

  // Nested property access with dot notation
  Handlebars.registerHelper("deepGet", (obj: unknown, path: string) => {
    // Exclude arrays and null at top level
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return undefined;
    const keys = String(path).split(".");
    let current: unknown = obj;
    for (const key of keys) {
      // Allow arrays in nested paths (e.g., "items.0.name")
      if (current && typeof current === "object" && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return current;
  });

  // Object/array checks
  Handlebars.registerHelper("isEmpty", (value: unknown) => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "object") return Object.keys(value).length === 0;
    if (typeof value === "string") return value.length === 0;
    return false;
  });

  Handlebars.registerHelper("isNotEmpty", (value: unknown) => {
    if (value === null || value === undefined) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    if (typeof value === "string") return value.length > 0;
    return true;
  });
}
