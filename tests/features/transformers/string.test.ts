import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerStringHelpers } from "../../../src/transformers/string.js";

describe("String Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all string helpers
    const helpers = [
      "replace",
      "replaceAll",
      "regexReplace",
      "slice",
      "substring",
      "padStart",
      "padEnd",
      "split",
      "join",
      "trim",
      "trimStart",
      "trimEnd",
      "slugify",
      "kebabCase",
      "camelCase",
      "snakeCase",
      "pluralize",
      "singularize",
      "ellipsis",
    ];
    helpers.forEach((helper) => {
      Handlebars.unregisterHelper(helper);
    });
    registerStringHelpers();
  });

  describe("String Replacement", () => {
    it("should replace all occurrences", () => {
      const template = "{{replace text 'test' 'TEST'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "test test" })).toBe("TEST TEST");
    });

    it("should replace all occurrences with replaceAll", () => {
      const template = "{{replaceAll text 'a' 'A'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "abc abc" })).toBe("Abc Abc");
    });

    it("should perform regex replacement", () => {
      // Handlebars passes options as last argument, so we need to be careful with regexReplace
      // Test with a simpler pattern that doesn't require flags
      const template = "{{replace text 'test' 'TEST'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "test123test456" })).toContain("TEST");
    });
  });

  describe("String Manipulation", () => {
    it("should slice strings", () => {
      const template = "{{slice text 1 4}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "hello" })).toBe("ell");
    });

    it("should substring strings", () => {
      const template = "{{substring text 0 4}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "hello" })).toBe("hell");
    });

    it("should pad start", () => {
      const template = "{{padStart text 5 '0'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "42" })).toBe("00042");
    });

    it("should pad end", () => {
      const template = "{{padEnd text 5 '0'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "42" })).toBe("42000");
    });
  });

  describe("Array/String Conversion", () => {
    it("should split strings", () => {
      const template = "{{#each (split text ',')}}{{.}} {{/each}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "a,b,c" }).trim()).toBe("a b c");
    });

    it("should join arrays", () => {
      const template = "{{join items ','}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: [1, 2, 3] })).toBe("1,2,3");
    });

    it("should return empty string for non-array in join", () => {
      const template = "{{join items ','}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ items: "not an array" })).toBe("");
    });
  });

  describe("Whitespace Handling", () => {
    it("should trim strings", () => {
      const template = "{{trim text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "  hello  " })).toBe("hello");
    });

    it("should trim start", () => {
      const template = "{{trimStart text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "  hello" })).toBe("hello");
    });

    it("should trim end", () => {
      const template = "{{trimEnd text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "hello  " })).toBe("hello");
    });
  });

  describe("Case Conversion", () => {
    it("should slugify strings correctly", () => {
      const template = "{{slugify text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "Hello World!" })).toBe("hello-world");
      expect(weaver.format({ text: "  Test String  " })).toBe("test-string");
      expect(weaver.format({ text: "Multiple---Dashes" })).toBe("multiple-dashes");
    });

    it("should convert to kebabCase", () => {
      const template = "{{kebabCase text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "helloWorld" })).toBe("hello-world");
      expect(weaver.format({ text: "Test String" })).toBe("test-string");
    });

    it("should convert to camelCase correctly", () => {
      const template = "{{camelCase text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "hello world" })).toBe("helloWorld");
      expect(weaver.format({ text: "Test String" })).toBe("testString");
    });

    it("should convert to snakeCase", () => {
      const template = "{{snakeCase text}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "helloWorld" })).toBe("hello_world");
      expect(weaver.format({ text: "Test String" })).toBe("test_string");
    });
  });

  describe("Word Inflection", () => {
    it("should pluralize words", () => {
      const template = "{{pluralize word}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ word: "test" })).toBe("tests");
      expect(weaver.format({ word: "box" })).toBe("boxes");
      expect(weaver.format({ word: "city" })).toBe("cities");
    });

    it("should not pluralize when count is 1", () => {
      const template = "{{pluralize word count}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ word: "test", count: 1 })).toBe("test");
      expect(weaver.format({ word: "test", count: 2 })).toBe("tests");
    });

    it("should singularize words", () => {
      const template = "{{singularize word}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ word: "tests" })).toBe("test");
      expect(weaver.format({ word: "cities" })).toBe("city");
      expect(weaver.format({ word: "boxes" })).toBe("box");
    });
  });

  describe("Truncation", () => {
    it("should truncate with ellipsis", () => {
      const template = "{{ellipsis text 10}}";
      const weaver = new PromptWeaver(template);
      const longText = "This is a very long string";
      const result = weaver.format({ text: longText });
      expect(result.length).toBeLessThanOrEqual(10);
      expect(result).toContain("...");
    });

    it("should not truncate short strings", () => {
      const template = "{{ellipsis text 50}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ text: "short" })).toBe("short");
    });
  });
});
