import Handlebars from "handlebars";

/**
 * Register collection/array manipulation Handlebars helpers.
 */
export function registerCollectionHelpers(): void {
  // Array operations
  Handlebars.registerHelper(
    "filter",
    (array: unknown[], predicate: string, _options: Handlebars.HelperOptions) => {
      if (!Array.isArray(array)) return [];
      // For simple property checks, we'll use a basic filter
      // More complex predicates would require a more sophisticated implementation
      return array.filter((item) => {
        if (typeof item === "object" && item !== null && predicate in item) {
          return Boolean((item as Record<string, unknown>)[predicate]);
        }
        return Boolean(item);
      });
    }
  );

  Handlebars.registerHelper("map", (array: unknown[], property: string) => {
    if (!Array.isArray(array)) return [];
    return array.map((item) => {
      if (typeof item === "object" && item !== null && property in item) {
        return (item as Record<string, unknown>)[property];
      }
      return item;
    });
  });

  Handlebars.registerHelper(
    "reduce",
    (array: unknown[], initialValue: unknown, _options: Handlebars.HelperOptions) => {
      if (!Array.isArray(array)) return initialValue;
      // Basic reduce - for more complex operations, users can use block helpers
      return array.reduce((acc, item) => {
        // Simple sum for numbers
        if (typeof acc === "number" && typeof item === "number") {
          return acc + item;
        }
        return acc;
      }, initialValue);
    }
  );

  // Array search
  Handlebars.registerHelper("find", (array: unknown[], property: string, value: unknown) => {
    if (!Array.isArray(array)) return undefined;
    return array.find((item) => {
      if (typeof item === "object" && item !== null && property in item) {
        return (item as Record<string, unknown>)[property] === value;
      }
      return item === value;
    });
  });

  Handlebars.registerHelper("findIndex", (array: unknown[], property: string, value: unknown) => {
    if (!Array.isArray(array)) return -1;
    return array.findIndex((item) => {
      if (typeof item === "object" && item !== null && property in item) {
        return (item as Record<string, unknown>)[property] === value;
      }
      return item === value;
    });
  });

  Handlebars.registerHelper("includes", (array: unknown[], value: unknown) => {
    if (!Array.isArray(array)) return false;
    return array.includes(value);
  });

  // Array ordering
  Handlebars.registerHelper("sort", (array: unknown[], property?: string) => {
    if (!Array.isArray(array)) return [];
    const sorted = [...array];
    if (property) {
      return sorted.sort((a, b) => {
        const aVal =
          typeof a === "object" && a !== null && property in a
            ? (a as Record<string, unknown>)[property]
            : a;
        const bVal =
          typeof b === "object" && b !== null && property in b
            ? (b as Record<string, unknown>)[property]
            : b;
        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }
        return String(aVal).localeCompare(String(bVal));
      });
    }
    return sorted.sort();
  });

  Handlebars.registerHelper("reverse", (array: unknown[]) => {
    if (!Array.isArray(array)) return [];
    return [...array].reverse();
  });

  // Array access
  Handlebars.registerHelper("first", (array: unknown[]) => {
    if (!Array.isArray(array) || array.length === 0) return undefined;
    return array[0];
  });

  Handlebars.registerHelper("last", (array: unknown[]) => {
    if (!Array.isArray(array) || array.length === 0) return undefined;
    return array[array.length - 1];
  });

  Handlebars.registerHelper("nth", (array: unknown[], index: number) => {
    if (!Array.isArray(array)) return undefined;
    const idx = Number(index);
    if (idx < 0 || idx >= array.length) return undefined;
    return array[idx];
  });

  // Array manipulation
  Handlebars.registerHelper("unique", (array: unknown[]) => {
    if (!Array.isArray(array)) return [];
    return Array.from(new Set(array));
  });

  Handlebars.registerHelper("groupBy", (array: unknown[], property: string) => {
    if (!Array.isArray(array)) return {};
    const result: Record<string, unknown[]> = {};
    for (const item of array) {
      let key: string;
      if (typeof item === "object" && item !== null && property in item) {
        key = String((item as Record<string, unknown>)[property]);
      } else {
        key = String(item);
      }
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
    }
    return result;
  });

  Handlebars.registerHelper("partition", (array: unknown[], predicate: string) => {
    if (!Array.isArray(array)) return { true: [], false: [] };
    const trueItems: unknown[] = [];
    const falseItems: unknown[] = [];
    for (const item of array) {
      if (typeof item === "object" && item !== null && predicate in item) {
        if ((item as Record<string, unknown>)[predicate]) {
          trueItems.push(item);
        } else {
          falseItems.push(item);
        }
      } else if (item) {
        trueItems.push(item);
      } else {
        falseItems.push(item);
      }
    }
    return { true: trueItems, false: falseItems };
  });

  // Array transformation
  Handlebars.registerHelper("chunk", (array: unknown[], size: number) => {
    if (!Array.isArray(array)) return [];
    const chunkSize = Number(size) || 1;
    const chunks: unknown[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  });

  Handlebars.registerHelper("flatten", (array: unknown[]) => {
    if (!Array.isArray(array)) return [];
    const result: unknown[] = [];
    for (const item of array) {
      if (Array.isArray(item)) {
        result.push(...item);
      } else {
        result.push(item);
      }
    }
    return result;
  });

  // Array slicing (renamed to avoid conflict with string.slice)
  Handlebars.registerHelper("arraySlice", (array: unknown[], start: number, end?: number) => {
    if (!Array.isArray(array)) return [];
    return array.slice(start, end);
  });
}
