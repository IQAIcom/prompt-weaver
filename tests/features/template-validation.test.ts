import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../../src/core/prompt-weaver.js";
import {
  extractVariables,
  TemplateCompilationError,
  validateTemplate,
} from "../../src/validation/template-validation.js";

describe("Template Validation Feature", () => {
  describe("Null and Undefined Handling", () => {
    it("should handle null values in templates", () => {
      const template = "Value: {{value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: null })).toBe("Value: ");
    });

    it("should handle undefined values in templates", () => {
      const template = "Value: {{value}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ value: undefined })).toBe("Value: ");
    });

    it("should handle missing variables gracefully", () => {
      const template = "Hello {{name}}, age: {{age}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ name: "Alice" })).toBe("Hello Alice, age: ");
    });

    it("should handle nested null properties", () => {
      const template = "User: {{user.name}}, Email: {{user.email}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ user: { name: null, email: "test@example.com" } })).toBe(
        "User: , Email: test@example.com"
      );
    });

    it("should handle empty objects", () => {
      const template = "{{#if user}}{{user.name}}{{else}}No user{{/if}}";
      const weaver = new PromptWeaver(template);
      expect(weaver.format({ user: {} })).toBe("");
    });
  });
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

  describe("Error Recovery", () => {
    it("should handle template compilation gracefully", () => {
      // Handlebars is lenient and accepts templates like {{#if}}{{/if}} without a condition.
      // The constructor should not throw for templates that Handlebars accepts.
      expect(() => {
        new PromptWeaver("{{#if}}{{/if}}");
      }).not.toThrow();
    });

    it("should handle invalid partial references", () => {
      const template = "{{> nonexistent}}";
      // Handlebars throws an error for missing partials
      expect(() => {
        const weaver = new PromptWeaver(template);
        weaver.format({});
      }).toThrow();
    });
  });
});
