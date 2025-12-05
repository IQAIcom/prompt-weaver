import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../../src/prompt-weaver.js";

describe("Template Composition Feature", () => {
  describe("Compose", () => {
    it("should compose templates with default separator", () => {
      const templates = ["Hello", "World"];
      const result = PromptWeaver.compose(templates);
      expect(result).toBe("Hello\n\nWorld");
    });

    it("should compose templates with custom separator", () => {
      const templates = ["Hello", "World"];
      const result = PromptWeaver.compose(templates, "---");
      expect(result).toBe("Hello---World");
    });
  });

  describe("Compose and Create", () => {
    it("should create PromptWeaver from composed templates", () => {
      const templates = ["Hello {{name}}", "Goodbye {{name}}"];
      const weaver = PromptWeaver.composeAndCreate(templates);
      const result = weaver.format({ name: "World" });
      expect(result).toContain("Hello World");
      expect(result).toContain("Goodbye World");
    });
  });
});
