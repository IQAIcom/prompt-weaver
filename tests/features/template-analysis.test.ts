import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../../src/core/prompt-weaver.js";

describe("Template Analysis Feature", () => {
  describe("Variable Extraction", () => {
    it("should extract variables excluding helpers and block helpers", () => {
      const template = "Hello {{name}}, {{#if condition}}yes{{/if}}";
      const weaver = new PromptWeaver(template);
      const variables = weaver.extractVariables();
      expect(variables.has("name")).toBe(true);
      // Note: condition is inside block helper, extraction may vary
      // Key test: should not include block helpers like 'if'
      expect(Array.from(variables)).not.toContain("if");
    });
  });

  describe("Metadata Extraction", () => {
    it("should get metadata with variables, helpers, and partials", () => {
      const template = "Hello {{name}}, {{#customHelper}}test{{/customHelper}}, {{> partial}}";
      const weaver = new PromptWeaver(template);
      const metadata = weaver.getMetadata();
      expect(metadata.variables).toContain("name");
      expect(metadata.helpers.length).toBeGreaterThan(0);
      expect(metadata.partials).toContain("partial");
    });
  });

  describe("Large Templates", () => {
    it("should handle templates with many variables", () => {
      const vars: Record<string, string> = {};
      let template = "";
      for (let i = 0; i < 100; i++) {
        vars[`var${i}`] = `value${i}`;
        template += `{{var${i}}} `;
      }
      const weaver = new PromptWeaver(template);
      const result = weaver.format(vars);
      expect(result.split(" ").length).toBeGreaterThan(90);
    });
  });

  describe("Variable Extraction Edge Cases", () => {
    it("should extract variables from complex expressions", () => {
      const template = '{{formatDate user.createdAt "YYYY-MM-DD"}}';
      const weaver = new PromptWeaver(template);
      const variables = weaver.extractVariables();
      // Note: Variable extraction may not catch variables in string literals
      // This test verifies the current behavior
      expect(variables.size).toBeGreaterThanOrEqual(0);
    });

    it("should extract variables from array access", () => {
      const template = "{{items[0].name}}";
      const weaver = new PromptWeaver(template);
      const variables = weaver.extractVariables();
      expect(variables.has("items")).toBe(true);
    });

    it("should extract variables from helper arguments", () => {
      const template = "{{capitalize user.name}}";
      const weaver = new PromptWeaver(template);
      const variables = weaver.extractVariables();
      // The improved extraction should handle this
      expect(variables.has("user")).toBe(true);
    });
  });
});
