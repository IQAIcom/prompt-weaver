import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerConditionalHelpers } from "../../../src/transformers/conditional.js";

describe("Conditional Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all conditional helpers
    const helpers = ["ifElse", "switch", "case", "coalesce", "default", "exists", "isDefined"];
    helpers.forEach((helper) => Handlebars.unregisterHelper(helper));
    registerConditionalHelpers();
  });

  describe("ifElse", () => {
    it("should return ifTrue when condition is truthy", () => {
      const template = "{{ifElse condition 'yes' 'no'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ condition: true })).toBe("yes");
      expect(weaver.format({ condition: 1 })).toBe("yes");
      expect(weaver.format({ condition: "test" })).toBe("yes");
    });

    it("should return ifFalse when condition is falsy", () => {
      const template = "{{ifElse condition 'yes' 'no'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ condition: false })).toBe("no");
      expect(weaver.format({ condition: 0 })).toBe("no");
      expect(weaver.format({ condition: "" })).toBe("no");
      expect(weaver.format({ condition: null })).toBe("no");
    });
  });

  describe("Switch/Case", () => {
    it("should handle switch/case block helper interaction", () => {
      const template = `{{#switch value}}{{#case "a"}}Option A{{/case}}{{#case "b"}}Option B{{/case}}{{/switch}}`;
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "a" })).toBe("Option A");
      expect(weaver.format({ value: "b" })).toBe("Option B");
      expect(weaver.format({ value: "c" })).toBe("");
    });

    it("should handle numeric switch values", () => {
      const template = `{{#switch value}}{{#case 1}}One{{/case}}{{#case 2}}Two{{/case}}{{/switch}}`;
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1 })).toBe("One");
      expect(weaver.format({ value: 2 })).toBe("Two");
      expect(weaver.format({ value: 3 })).toBe("");
    });

    it("should handle multiple case matches", () => {
      const template = `{{#switch value}}{{#case "a"}}A{{/case}}{{#case "a"}}A2{{/case}}{{/switch}}`;
      const weaver = new PromptWeaver(template);
      const result = weaver.format({ value: "a" });
      expect(result).toContain("A");
    });
  });

  describe("Coalesce", () => {
    it("should return first non-null, non-undefined, non-empty value", () => {
      const template = "{{coalesce a b c}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: null, b: "", c: "value" })).toBe("value");
      expect(weaver.format({ a: "first", b: "second", c: "third" })).toBe("first");
    });

    it("should return empty string if all values are null/undefined/empty", () => {
      const template = "{{coalesce a b c}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: null, b: "", c: null })).toBe("");
    });

    it("should handle zero and false as valid values", () => {
      const template = "{{coalesce a b c}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: null, b: 0, c: "value" })).toBe("0");
      expect(weaver.format({ a: null, b: false, c: "value" })).toBe("false");
    });
  });

  describe("Default", () => {
    it("should return value if not null/undefined/empty", () => {
      const template = "{{default value 'default'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "test" })).toBe("test");
      expect(weaver.format({ value: 0 })).toBe("0");
      expect(weaver.format({ value: false })).toBe("false");
    });

    it("should return defaultValue if value is null/undefined/empty", () => {
      const template = "{{default value 'default'}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: null })).toBe("default");
      expect(weaver.format({ value: undefined })).toBe("default");
      expect(weaver.format({ value: "" })).toBe("default");
    });
  });

  describe("Exists", () => {
    it("should return true for non-null, non-undefined values", () => {
      const template = "{{#if (exists value)}}Exists{{else}}Not Exists{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "test" })).toBe("Exists");
      expect(weaver.format({ value: 0 })).toBe("Exists");
      expect(weaver.format({ value: false })).toBe("Exists");
      expect(weaver.format({ value: "" })).toBe("Exists");
    });

    it("should return false for null or undefined", () => {
      const template = "{{#if (exists value)}}Exists{{else}}Not Exists{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: null })).toBe("Not Exists");
      expect(weaver.format({ value: undefined })).toBe("Not Exists");
    });
  });

  describe("isDefined", () => {
    it("should return true for defined values including null", () => {
      const template = "{{#if (isDefined value)}}Defined{{else}}Not Defined{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "test" })).toBe("Defined");
      expect(weaver.format({ value: null })).toBe("Defined");
      expect(weaver.format({ value: 0 })).toBe("Defined");
    });

    it("should return false for undefined", () => {
      const template = "{{#if (isDefined value)}}Defined{{else}}Not Defined{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: undefined })).toBe("Not Defined");
    });
  });
});
