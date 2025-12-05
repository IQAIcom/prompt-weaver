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
});
