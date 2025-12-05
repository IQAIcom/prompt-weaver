import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { formatters } from "../../../src/transformers/formatters.js";

describe("Formatters Feature", () => {
  beforeEach(() => {
    // Register formatters as Handlebars helpers for testing
    Object.keys(formatters).forEach((name) => {
      Handlebars.unregisterHelper(name);
      Handlebars.registerHelper(name, formatters[name]);
    });
  });

  describe("Currency Formatting", () => {
    it("should format currency with two decimals", () => {
      const template = "{{currency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234.56 })).toBe("$1,234.56");
    });

    it("should format currency with commas for large numbers", () => {
      const template = "{{currency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234567.89 })).toBe("$1,234,567.89");
    });

    it("should handle negative currency", () => {
      const template = "{{currency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: -1234.56 })).toBe("$1,234.56");
    });

    it("should format zero currency", () => {
      const template = "{{currency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 0 })).toBe("$0.00");
    });

    it("should format signed currency with positive sign", () => {
      const template = "{{signedCurrency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234.56 })).toBe("+$1,234.56");
    });

    it("should format signed currency with negative sign", () => {
      const template = "{{signedCurrency value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: -1234.56 })).toBe("-$1,234.56");
    });
  });

  describe("Price Formatting", () => {
    it("should format price with 4 decimals", () => {
      const template = "{{price value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 0.1234 })).toBe("$0.1234");
    });

    it("should format price with fewer decimals", () => {
      const template = "{{price value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 0.12 })).toBe("$0.12");
    });
  });

  describe("Percent Formatting", () => {
    it("should format percent with two decimals", () => {
      const template = "{{percent value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 12.34 })).toBe("12.34%");
    });

    it("should format signed percent with positive sign", () => {
      const template = "{{signedPercent value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 12.34 })).toBe("+12.34%");
    });

    it("should format signed percent with negative sign", () => {
      const template = "{{signedPercent value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: -12.34 })).toBe("-12.34%");
    });

    it("should format zero percent", () => {
      const template = "{{percent value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 0 })).toBe("0.00%");
    });
  });

  describe("Number Formatting", () => {
    it("should format integer with commas", () => {
      const template = "{{integer value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234 })).toBe("1,234");
    });

    it("should round and format integer", () => {
      const template = "{{integer value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234.56 })).toBe("1,235");
    });

    it("should format number with commas", () => {
      const template = "{{number value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234.56 })).toBe("1,234.56");
    });

    it("should format large numbers with commas", () => {
      const template = "{{number value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1234567.89 })).toBe("1,234,567.89");
    });
  });

  describe("Compact Formatting", () => {
    it("should format billions as B", () => {
      const template = "{{compact value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 1500000000 })).toBe("1.5B");
    });

    it("should format millions as M", () => {
      const template = "{{compact value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 3500000 })).toBe("3.5M");
    });

    it("should format thousands as K", () => {
      const template = "{{compact value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 2500 })).toBe("2.5K");
    });

    it("should format small numbers without suffix", () => {
      const template = "{{compact value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 500 })).toBe("500");
    });

    it("should handle negative compact numbers", () => {
      const template = "{{compact value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: -2500 })).toBe("-2.5K");
    });
  });

  describe("String Formatting", () => {
    it("should convert to uppercase", () => {
      const template = "{{upper value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "hello" })).toBe("HELLO");
    });

    it("should convert to lowercase", () => {
      const template = "{{lower value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "HELLO" })).toBe("hello");
    });

    it("should capitalize first letter", () => {
      const template = "{{capitalize value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "hello" })).toBe("Hello");
    });

    it("should capitalize single character", () => {
      const template = "{{capitalize value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "h" })).toBe("H");
    });

    it("should handle empty string in capitalize", () => {
      const template = "{{capitalize value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "" })).toBe("");
    });
  });

  describe("Truncation", () => {
    it("should truncate long strings", () => {
      const template = "{{truncate value}}";
      const weaver = new PromptWeaver(template);
      const longString = "a".repeat(100);
      const result = weaver.format({ value: longString });
      expect(result.length).toBe(50);
      expect(result).toContain("...");
    });

    it("should not truncate short strings", () => {
      const template = "{{truncate value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "short" })).toBe("short");
    });
  });

  describe("JSON Formatting", () => {
    it("should stringify objects", () => {
      const template = "{{json value}}";
      const weaver = new PromptWeaver(template);
      const obj = { name: "test", value: 123 };
      const result = weaver.format({ value: obj });
      // Handlebars HTML-escapes quotes, so we check for the HTML entity
      expect(result).toContain("&quot;name&quot;");
      expect(result).toContain("&quot;test&quot;");
    });

    it("should stringify arrays", () => {
      const template = "{{json value}}";
      const weaver = new PromptWeaver(template);
      const arr = [1, 2, 3];
      expect(weaver.format({ value: arr })).toBe("[1,2,3]");
    });

    it("should stringify strings", () => {
      const template = "{{json value}}";
      const weaver = new PromptWeaver(template);
      // Handlebars HTML-escapes quotes
      expect(weaver.format({ value: "test" })).toBe("&quot;test&quot;");
    });
  });
});
