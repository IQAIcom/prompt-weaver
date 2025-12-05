import Handlebars from "handlebars";

/**
 * Register string manipulation Handlebars helpers.
 */
export function registerStringHelpers(): void {
  // String replacement
  Handlebars.registerHelper("replace", (str: string, search: string, replace: string) => {
    return String(str).replace(new RegExp(search, "g"), replace);
  });

  Handlebars.registerHelper("replaceAll", (str: string, search: string, replace: string) => {
    return String(str).split(search).join(replace);
  });

  Handlebars.registerHelper(
    "regexReplace",
    (str: string, pattern: string, replacement: string, flags?: string) => {
      const regex = new RegExp(pattern, flags || "g");
      return String(str).replace(regex, replacement);
    }
  );

  // String manipulation
  Handlebars.registerHelper("slice", (str: string, start: number, end?: number) => {
    return String(str).slice(start, end);
  });

  Handlebars.registerHelper("substring", (str: string, start: number, end?: number) => {
    return String(str).substring(start, end);
  });

  Handlebars.registerHelper("padStart", (str: string, length: number, padString?: string) => {
    return String(str).padStart(length, padString || " ");
  });

  Handlebars.registerHelper("padEnd", (str: string, length: number, padString?: string) => {
    return String(str).padEnd(length, padString || " ");
  });

  // Array/string conversion
  Handlebars.registerHelper("split", (str: string, separator: string) => {
    return String(str).split(separator);
  });

  Handlebars.registerHelper("join", (arr: unknown[], separator: string) => {
    if (!Array.isArray(arr)) return "";
    return arr.map(String).join(separator);
  });

  // Whitespace handling
  Handlebars.registerHelper("trim", (str: string) => {
    return String(str).trim();
  });

  Handlebars.registerHelper("trimStart", (str: string) => {
    return String(str).trimStart();
  });

  Handlebars.registerHelper("trimEnd", (str: string) => {
    return String(str).trimEnd();
  });

  // Case conversion
  Handlebars.registerHelper("slugify", (str: string) => {
    return String(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  Handlebars.registerHelper("kebabCase", (str: string) => {
    return String(str)
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  });

  Handlebars.registerHelper("camelCase", (str: string) => {
    return String(str)
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");
  });

  Handlebars.registerHelper("snakeCase", (str: string) => {
    return String(str)
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();
  });

  // Word inflection (basic implementation)
  Handlebars.registerHelper("pluralize", (str: string, count?: number) => {
    const s = String(str);
    if (count !== undefined && count === 1) return s;
    if (s.endsWith("y")) return `${s.slice(0, -1)}ies`;
    if (
      s.endsWith("s") ||
      s.endsWith("x") ||
      s.endsWith("z") ||
      s.endsWith("ch") ||
      s.endsWith("sh")
    ) {
      return `${s}es`;
    }
    return `${s}s`;
  });

  Handlebars.registerHelper("singularize", (str: string) => {
    const s = String(str);
    if (s.endsWith("ies")) return `${s.slice(0, -3)}y`;
    if (s.endsWith("es") && s.length > 2) {
      const beforeEs = s.slice(0, -2);
      if (
        beforeEs.endsWith("s") ||
        beforeEs.endsWith("x") ||
        beforeEs.endsWith("z") ||
        beforeEs.endsWith("ch") ||
        beforeEs.endsWith("sh")
      ) {
        return beforeEs;
      }
    }
    if (s.endsWith("s") && s.length > 1) return s.slice(0, -1);
    return s;
  });

  // Smart truncation with configurable length
  Handlebars.registerHelper("ellipsis", (str: string, maxLength: number) => {
    const s = String(str);
    const length = Number(maxLength) || 50;
    return s.length > length ? `${s.slice(0, length - 3)}...` : s;
  });
}
