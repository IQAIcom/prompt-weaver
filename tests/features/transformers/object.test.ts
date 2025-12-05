import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerObjectHelpers } from "../../../src/transformers/object.js";

describe("Object Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all object helpers
    const helpers = [
      "get",
      "has",
      "keys",
      "values",
      "pick",
      "omit",
      "merge",
      "defaults",
      "deepGet",
      "isEmpty",
      "isNotEmpty",
    ];
    helpers.forEach((helper) => Handlebars.unregisterHelper(helper));
    registerObjectHelpers();
  });

  describe("Object Access", () => {
    it("should get property value", () => {
      const template = "{{get obj 'name'}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice", age: 30 } };
      expect(weaver.format(data)).toBe("Alice");
    });

    it("should return undefined for non-existent property", () => {
      const template = "{{get obj 'missing'}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice" } };
      expect(weaver.format(data)).toBe("");
    });

    it("should return undefined for non-object input", () => {
      const template = "{{get obj 'name'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });

    it("should return undefined for array input in get", () => {
      const template = "{{get obj '0'}}";
      const weaver = new PromptWeaver(template);
      // Arrays should be excluded from get operations
      expect(weaver.format({ obj: [1, 2, 3] })).toBe("");
    });

    it("should check if object has property", () => {
      const template = "{{#if (has obj 'name')}}Has name{{else}}No name{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: { name: "Alice" } })).toBe("Has name");
      expect(weaver.format({ obj: { age: 30 } })).toBe("No name");
    });

    it("should return false for non-object in has", () => {
      const template = "{{has obj 'name'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: "not an object" })).toBe("false");
    });
  });

  describe("Object Keys and Values", () => {
    it("should get object keys", () => {
      const template = "{{#each (keys obj)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice", age: 30 } };
      const result = weaver.format(data);
      expect(result).toContain("name");
      expect(result).toContain("age");
    });

    it("should return empty array for non-object in keys", () => {
      const template = "{{keys obj}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });

    it("should get object values", () => {
      const template = "{{#each (values obj)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice", age: 30 } };
      const result = weaver.format(data);
      expect(result).toContain("Alice");
      expect(result).toContain("30");
    });

    it("should return empty array for non-object in values", () => {
      const template = "{{values obj}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });
  });

  describe("Object Filtering", () => {
    it("should pick specified properties", () => {
      const template = "{{#each (pick obj 'name' 'age')}}{{@key}}:{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice", age: 30, city: "NYC" } };
      const result = weaver.format(data);
      expect(result).toContain("name");
      expect(result).toContain("age");
      expect(result).not.toContain("city");
    });

    it("should return empty object for non-object in pick", () => {
      const template = "{{#each (pick obj 'name')}}{{@key}}{{/each}}";
      const weaver = new PromptWeaver(template);
      // Empty object renders as empty string when iterated
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });

    it("should return empty object for array input in pick", () => {
      const template = "{{#each (pick obj 'name')}}{{@key}}{{/each}}";
      const weaver = new PromptWeaver(template);
      // Arrays should be excluded from pick operations
      expect(weaver.format({ obj: [1, 2, 3] })).toBe("");
    });

    it("should omit specified properties", () => {
      const template = "{{#each (omit obj 'city')}}{{@key}}:{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice", age: 30, city: "NYC" } };
      const result = weaver.format(data);
      expect(result).toContain("name");
      expect(result).toContain("age");
      expect(result).not.toContain("city");
    });

    it("should return empty object for non-object in omit", () => {
      const template = "{{#each (omit obj 'name')}}{{@key}}{{/each}}";
      const weaver = new PromptWeaver(template);
      // Empty object renders as empty string when iterated
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });

    it("should return empty object for array input in omit", () => {
      const template = "{{#each (omit obj 'name')}}{{@key}}{{/each}}";
      const weaver = new PromptWeaver(template);
      // Arrays should be excluded from omit operations
      expect(weaver.format({ obj: [1, 2, 3] })).toBe("");
    });
  });

  describe("Object Merging", () => {
    it("should merge multiple objects", () => {
      const template = "{{#each (merge obj1 obj2)}}{{@key}}:{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        obj1: { a: 1, b: 2 },
        obj2: { b: 3, c: 4 },
      };
      const result = weaver.format(data);
      expect(result).toContain("a");
      expect(result).toContain("c");
      // b should be from obj2 (last merged)
      expect(result).toContain("b");
    });

    it("should apply defaults to object", () => {
      const template = "{{#each (defaults obj defaults)}}{{@key}}:{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        obj: { name: "Alice", age: 30 },
        defaults: { age: 25, city: "NYC" },
      };
      const result = weaver.format(data);
      expect(result).toContain("name");
      expect(result).toContain("age");
      expect(result).toContain("city");
      // age should be from obj (not defaults)
      expect(result).toContain("30");
    });
  });

  describe("Deep Property Access", () => {
    it("should access nested properties with dot notation", () => {
      const template = "{{deepGet obj 'user.name'}}";
      const weaver = new PromptWeaver(template);
      const data = {
        obj: {
          user: {
            name: "Alice",
            age: 30,
          },
        },
      };
      expect(weaver.format(data)).toBe("Alice");
    });

    it("should access deeply nested properties", () => {
      const template = "{{deepGet obj 'a.b.c'}}";
      const weaver = new PromptWeaver(template);
      const data = {
        obj: {
          a: {
            b: {
              c: "deep value",
            },
          },
        },
      };
      expect(weaver.format(data)).toBe("deep value");
    });

    it("should return undefined for non-existent path", () => {
      const template = "{{deepGet obj 'missing.path'}}";
      const weaver = new PromptWeaver(template);
      const data = { obj: { name: "Alice" } };
      expect(weaver.format(data)).toBe("");
    });

    it("should return undefined for non-object in deepGet", () => {
      const template = "{{deepGet obj 'path'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: "not an object" })).toBe("");
    });
  });

  describe("Empty Checks", () => {
    it("should check if array is empty", () => {
      const template = "{{#if (isEmpty items)}}Empty{{else}}Not Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [] })).toBe("Empty");
      expect(weaver.format({ items: [1, 2] })).toBe("Not Empty");
    });

    it("should check if object is empty", () => {
      const template = "{{#if (isEmpty obj)}}Empty{{else}}Not Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ obj: {} })).toBe("Empty");
      expect(weaver.format({ obj: { name: "Alice" } })).toBe("Not Empty");
    });

    it("should check if string is empty", () => {
      const template = "{{#if (isEmpty str)}}Empty{{else}}Not Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ str: "" })).toBe("Empty");
      expect(weaver.format({ str: "hello" })).toBe("Not Empty");
    });

    it("should check if null/undefined is empty", () => {
      const template = "{{#if (isEmpty value)}}Empty{{else}}Not Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: null })).toBe("Empty");
      expect(weaver.format({ value: undefined })).toBe("Empty");
    });

    it("should check if value is not empty", () => {
      const template = "{{#if (isNotEmpty items)}}Not Empty{{else}}Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2] })).toBe("Not Empty");
      expect(weaver.format({ items: [] })).toBe("Empty");
    });

    it("should handle non-empty number", () => {
      const template = "{{#if (isNotEmpty value)}}Not Empty{{else}}Empty{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 0 })).toBe("Not Empty");
      expect(weaver.format({ value: 42 })).toBe("Not Empty");
    });
  });
});
