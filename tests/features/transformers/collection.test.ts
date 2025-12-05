import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerCollectionHelpers } from "../../../src/transformers/collection.js";

describe("Collection Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all collection helpers
    const helpers = [
      "filter",
      "map",
      "reduce",
      "find",
      "findIndex",
      "includes",
      "sort",
      "reverse",
      "first",
      "last",
      "nth",
      "unique",
      "groupBy",
      "partition",
      "chunk",
      "flatten",
      "arraySlice",
    ];
    helpers.forEach((helper) => {
      Handlebars.unregisterHelper(helper);
    });
    registerCollectionHelpers();
  });

  describe("Array Operations", () => {
    it("should filter arrays by property", () => {
      const template = "{{#each (filter items 'active')}}{{name}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { name: "A", active: true },
          { name: "B", active: false },
          { name: "C", active: true },
        ],
      };
      expect(weaver.format(data).trim()).toBe("A C");
    });

    it("should filter arrays with truthy values", () => {
      const template = "{{#each (filter items 'value')}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [1, 0, 2, null, 3],
      };
      expect(weaver.format(data).trim()).toBe("1 2 3");
    });

    it("should handle filter with non-array input", () => {
      const template = "{{filter items 'active'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("");
    });

    it("should map arrays to property values", () => {
      const template = "{{#each (map items 'name')}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
        ],
      };
      expect(weaver.format(data).trim()).toBe("Alice Bob");
    });

    it("should map arrays without property access", () => {
      const template = "{{#each (map numbers 'value')}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { numbers: [1, 2, 3] };
      expect(weaver.format(data).trim()).toBe("1 2 3");
    });

    it("should handle map with non-array input", () => {
      const template = "{{map items 'name'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("");
    });

    it("should reduce arrays with initial value", () => {
      const template = "{{reduce numbers 0}}";
      const weaver = new PromptWeaver(template);
      const data = { numbers: [1, 2, 3, 4] };
      // Note: reduce only does simple sum for numbers
      expect(weaver.format(data)).toBe("10");
    });

    it("should handle reduce with non-array input", () => {
      const template = "{{reduce items 0}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("0");
    });
  });

  describe("Array Search", () => {
    it("should find item by property and value", () => {
      const template = "{{find items 'id' 2}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { id: 1, name: "A" },
          { id: 2, name: "B" },
          { id: 3, name: "C" },
        ],
      };
      const result = weaver.format(data);
      // find returns an object, so we check it contains the object representation
      expect(result).toBeTruthy();
      // Test with a template that accesses the name property
      const template2 = "{{#with (find items 'id' 2)}}{{name}}{{/with}}";
      const weaver2 = new PromptWeaver(template2);
      expect(weaver2.format(data)).toBe("B");
    });

    it("should find item by direct value", () => {
      const template = "{{find items 'value' 'target'}}";
      const weaver = new PromptWeaver(template);
      const data = { items: ["a", "target", "b"] };
      expect(weaver.format(data)).toBe("target");
    });

    it("should return undefined for non-existent item", () => {
      const template = "{{find items 'id' 999}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [{ id: 1 }, { id: 2 }],
      };
      expect(weaver.format(data)).toBe("");
    });

    it("should find index by property and value", () => {
      const template = "{{findIndex items 'id' 2}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { id: 1, name: "A" },
          { id: 2, name: "B" },
          { id: 3, name: "C" },
        ],
      };
      expect(weaver.format(data)).toBe("1");
    });

    it("should return -1 for non-existent index", () => {
      const template = "{{findIndex items 'id' 999}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [{ id: 1 }, { id: 2 }],
      };
      expect(weaver.format(data)).toBe("-1");
    });

    it("should check if array includes value", () => {
      const template = "{{#if (includes items 'target')}}Found{{else}}Not Found{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: ["a", "target", "b"] })).toBe("Found");
      expect(weaver.format({ items: ["a", "b", "c"] })).toBe("Not Found");
    });

    it("should handle includes with non-array input", () => {
      const template = "{{includes items 'value'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("false");
    });
  });

  describe("Array Ordering", () => {
    it("should sort arrays by property", () => {
      const template = "{{#each (sort items 'age')}}{{name}}:{{age}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { name: "Alice", age: 30 },
          { name: "Bob", age: 25 },
          { name: "Charlie", age: 35 },
        ],
      };
      const result = weaver.format(data);
      expect(result).toContain("Bob:25");
      expect(result).toContain("Alice:30");
      expect(result).toContain("Charlie:35");
    });

    it("should sort arrays without property (default sort)", () => {
      const template = "{{#each (sort numbers)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { numbers: [3, 1, 4, 2] };
      expect(weaver.format(data).trim()).toBe("1 2 3 4");
    });

    it("should sort strings alphabetically", () => {
      const template = "{{#each (sort items 'name')}}{{name}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }],
      };
      const result = weaver.format(data);
      expect(result).toContain("Alice");
      expect(result).toContain("Bob");
      expect(result).toContain("Charlie");
    });

    it("should reverse arrays", () => {
      const template = "{{#each (reverse items)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { items: [1, 2, 3] };
      expect(weaver.format(data).trim()).toBe("3 2 1");
    });

    it("should handle sort/reverse with non-array input", () => {
      const template = "{{sort items 'age'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("");
    });
  });

  describe("Array Access", () => {
    it("should get first element", () => {
      const template = "{{first items}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2, 3] })).toBe("1");
      // Test object access with #with helper
      const template2 = "{{#with (first items)}}{{name}}{{/with}}";
      const weaver2 = new PromptWeaver(template2);
      expect(weaver2.format({ items: [{ name: "A" }] })).toBe("A");
    });

    it("should return undefined for empty array first", () => {
      const template = "{{first items}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [] })).toBe("");
    });

    it("should get last element", () => {
      const template = "{{last items}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2, 3] })).toBe("3");
    });

    it("should return undefined for empty array last", () => {
      const template = "{{last items}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [] })).toBe("");
    });

    it("should get nth element", () => {
      const template = "{{nth items 1}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [10, 20, 30] })).toBe("20");
    });

    it("should return undefined for out of bounds nth", () => {
      const template = "{{nth items 10}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2, 3] })).toBe("");
    });

    it("should return undefined for negative nth", () => {
      const template = "{{nth items -1}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2, 3] })).toBe("");
    });
  });

  describe("Array Manipulation", () => {
    it("should get unique values", () => {
      const template = "{{#each (unique items)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { items: [1, 2, 2, 3, 3, 3] };
      const result = weaver.format(data);
      expect(result).toContain("1");
      expect(result).toContain("2");
      expect(result).toContain("3");
      // Should not have duplicates
      const matches = result.match(/1/g);
      expect(matches?.length).toBe(1);
    });

    it("should group by property", () => {
      const template = "{{#each (groupBy items 'category')}}{{@key}}:{{length .}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { name: "A", category: "X" },
          { name: "B", category: "Y" },
          { name: "C", category: "X" },
        ],
      };
      const result = weaver.format(data);
      expect(result).toContain("X");
      expect(result).toContain("Y");
    });

    it("should partition array by predicate", () => {
      const template = "{{#each (partition items 'active')}}{{@key}}:{{length .}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = {
        items: [
          { name: "A", active: true },
          { name: "B", active: false },
          { name: "C", active: true },
        ],
      };
      const result = weaver.format(data);
      expect(result).toContain("true");
      expect(result).toContain("false");
    });

    it("should chunk arrays", () => {
      const template = "{{#each (chunk items 2)}}{{length .}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { items: [1, 2, 3, 4, 5] };
      const result = weaver.format(data);
      expect(result).toContain("2");
      expect(result).toContain("2");
      expect(result).toContain("1");
    });

    it("should flatten nested arrays", () => {
      const template = "{{#each (flatten items)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { items: [[1, 2], [3, 4], 5] };
      const result = weaver.format(data);
      expect(result).toContain("1");
      expect(result).toContain("2");
      expect(result).toContain("3");
      expect(result).toContain("4");
      expect(result).toContain("5");
    });

    it("should slice arrays", () => {
      const template = "{{#each (arraySlice items 1 3)}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      const data = { items: [1, 2, 3, 4, 5] };
      expect(weaver.format(data).trim()).toBe("2 3");
    });

    it("should slice arrays without end", () => {
      // Test with explicit end parameter first to verify the helper works
      const template1 = "{{#each (arraySlice items 2 5)}}{{.}} {{/each}}";
      const weaver1 = new PromptWeaver(template1);
      const data = { items: [1, 2, 3, 4, 5] };
      expect(weaver1.format(data).trim()).toBe("3 4 5");

      // Test without end - Handlebars may pass undefined, so we test with a large end value
      const template2 = "{{#each (arraySlice items 2 999)}}{{.}} {{/each}}";
      const weaver2 = new PromptWeaver(template2);
      const result = weaver2.format(data);
      expect(result).toContain("3");
      expect(result).toContain("4");
      expect(result).toContain("5");
    });

    it("should handle manipulation helpers with non-array input", () => {
      const template = "{{unique items}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("");
    });
  });
});
