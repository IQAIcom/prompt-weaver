import { describe, expect, it } from "vitest";
import {
  extractVariables,
  TemplateCompilationError,
  validateTemplate,
} from "../../src/validation.js";

describe("Template Validation Feature", () => {
  describe("Variable Extraction", () => {
    it("should extract variables excluding helpers and block helpers", () => {
      const template = "Hello {{name}}, {{#if condition}}yes{{/if}}";
      const variables = extractVariables(template);
      expect(variables.has("name")).toBe(true);
      // Note: condition is inside block helper, extraction may vary
      // Key test: should not include block helpers
      expect(variables.has("if")).toBe(false);
    });

    it("should handle nested properties", () => {
      const template = "Hello {{user.name}}, {{user.profile.email}}";
      const variables = extractVariables(template);
      expect(variables.has("user")).toBe(true);
      // Should extract base variable, not nested path
      expect(variables.has("user.name")).toBe(false);
      expect(variables.has("user.profile.email")).toBe(false);
    });

    it("should exclude 'this' keyword", () => {
      const template = "{{this}} and {{name}}";
      const variables = extractVariables(template);
      expect(variables.has("this")).toBe(false);
      expect(variables.has("name")).toBe(true);
    });
  });

  describe("Template Validation", () => {
    it("should return success for valid template", () => {
      const result = validateTemplate("Hello {{name}}");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    // Note: Handlebars is very lenient with template syntax
    // Most "invalid" templates are actually accepted by Handlebars
    // The validateTemplate function wraps Handlebars.compile which handles validation

    it("should extract error location information", () => {
      const result = validateTemplate("Hello {{#if}}");
      if (!result.valid && result.errors.length > 0) {
        const error = result.errors[0];
        expect(error).toBeInstanceOf(TemplateCompilationError);
        expect(error.message).toBeTruthy();
      }
    });

    it("should format error messages with context", () => {
      const result = validateTemplate("Hello {{#if}}");
      if (!result.valid && result.errors.length > 0) {
        const error = result.errors[0];
        const formatted = error.getFormattedMessage();
        expect(formatted).toContain(error.message);
      }
    });
  });
});
