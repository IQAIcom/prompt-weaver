import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/core/prompt-weaver.js";
import { registerArithmeticHelpers } from "../../../src/transformers/arithmetic.js";

describe("Arithmetic Transformers Feature", () => {
  beforeEach(() => {
    // Unregister all arithmetic helpers
    const helpers = ["increment", "add", "multiply", "divide", "subtract"];
    helpers.forEach((helper) => {
      Handlebars.unregisterHelper(helper);
    });
    registerArithmeticHelpers();
  });

  describe("Increment", () => {
    it("should increment number by 1", () => {
      const template = "{{increment value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: 5 })).toBe("6");
      expect(weaver.format({ value: 0 })).toBe("1");
      expect(weaver.format({ value: -1 })).toBe("0");
    });

    it("should handle string numbers", () => {
      const template = "{{increment value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: "10" })).toBe("11");
    });
  });

  describe("Add", () => {
    it("should add two numbers", () => {
      const template = "{{add a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 5, b: 3 })).toBe("8");
      expect(weaver.format({ a: -5, b: 3 })).toBe("-2");
    });

    it("should handle decimal numbers", () => {
      const template = "{{add a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 1.5, b: 2.3 })).toBe("3.8");
    });

    it("should handle string numbers", () => {
      const template = "{{add a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: "10", b: "20" })).toBe("30");
    });
  });

  describe("Subtract", () => {
    it("should subtract two numbers", () => {
      const template = "{{subtract a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 10, b: 3 })).toBe("7");
      expect(weaver.format({ a: 5, b: 10 })).toBe("-5");
    });

    it("should handle decimal numbers", () => {
      const template = "{{subtract a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 5.5, b: 2.3 })).toBe("3.2");
    });
  });

  describe("Multiply", () => {
    it("should multiply two numbers", () => {
      const template = "{{multiply a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 5, b: 3 })).toBe("15");
      expect(weaver.format({ a: -5, b: 3 })).toBe("-15");
    });

    it("should handle decimal numbers", () => {
      const template = "{{multiply a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 2.5, b: 4 })).toBe("10");
    });

    it("should handle zero multiplication", () => {
      const template = "{{multiply a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 5, b: 0 })).toBe("0");
    });
  });

  describe("Divide", () => {
    it("should divide two numbers", () => {
      const template = "{{divide a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 10, b: 2 })).toBe("5");
      expect(weaver.format({ a: 5, b: 2 })).toBe("2.5");
    });

    it("should handle division by zero", () => {
      const template = "{{divide a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 10, b: 0 })).toBe("0");
    });

    it("should handle decimal division", () => {
      const template = "{{divide a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: 7, b: 2 })).toBe("3.5");
    });

    it("should handle negative numbers", () => {
      const template = "{{divide a b}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ a: -10, b: 2 })).toBe("-5");
      expect(weaver.format({ a: 10, b: -2 })).toBe("-5");
    });
  });
});
