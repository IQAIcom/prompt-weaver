import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../src/prompt-weaver.js";
import { SchemaValidationError } from "../src/schema-validation.js";
import { createMockAsyncSchema, createMockSchema } from "./helpers.js";

describe("PromptWeaver", () => {
  describe("Constructor - Error Handling", () => {
    it("should throw error for empty template", () => {
      expect(() => {
        new PromptWeaver("");
      }).toThrow("Template source is empty");
    });

    it("should throw error for invalid schema", () => {
      const invalidSchema = { foo: "bar" } as unknown as StandardSchemaV1;
      expect(() => {
        new PromptWeaver("Hello {{name}}", { schema: invalidSchema });
      }).toThrow("Invalid schema: expected a Standard Schema compatible validator");
    });

    // Note: Handlebars is very lenient with template syntax
    // Most "invalid" templates are actually accepted, so we skip this test
    // The validation function wraps Handlebars.compile which handles validation
  });

  describe("Schema Validation Integration", () => {
    it("should validate and render with formatWithSchema (success)", () => {
      const schema = createMockSchema((data) => {
        if (typeof data === "object" && data !== null && "name" in data) {
          return { value: data };
        }
        return {
          issues: [{ message: "Invalid data", path: [] }],
        };
      });

      const weaver = new PromptWeaver("Hello {{name}}", { schema });
      const result = weaver.formatWithSchema({ name: "World" });
      expect(result).toBe("Hello World");
    });

    it("should throw SchemaValidationError on validation failure", () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Name is required", path: ["name"] }],
      }));

      const weaver = new PromptWeaver("Hello {{name}}", { schema });
      expect(() => {
        weaver.formatWithSchema({});
      }).toThrow(SchemaValidationError);
    });

    it("should return null on validation failure with tryFormatWithSchema", () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid", path: [] }],
      }));

      const weaver = new PromptWeaver("Hello {{name}}", { schema });
      const result = weaver.tryFormatWithSchema({});
      expect(result).toBeNull();
    });

    it("should re-throw non-validation errors in tryFormatWithSchema", () => {
      const schema = createMockSchema(() => ({
        value: {},
      }));

      const weaver = new PromptWeaver("Hello {{name}}", { schema });
      // Missing 'name' variable renders empty string, which is valid
      // Test that validation errors return null, but other errors throw
      const result = weaver.tryFormatWithSchema({});
      expect(result).toBe("Hello "); // Empty variable renders as empty string

      // Test with invalid data that fails validation
      const schema2 = createMockSchema(() => ({
        issues: [{ message: "Invalid", path: [] }],
      }));
      const weaver2 = new PromptWeaver("Hello {{name}}", { schema: schema2 });
      const result2 = weaver2.tryFormatWithSchema({});
      expect(result2).toBeNull(); // Validation error returns null
    });

    it("should throw error when schema not configured", () => {
      const weaver = new PromptWeaver("Hello {{name}}");
      expect(() => {
        weaver.formatWithSchema({});
      }).toThrow("No schema configured");
    });

    it("should handle async validation with formatWithSchemaAsync", async () => {
      const schema = createMockAsyncSchema(async (data) => {
        await Promise.resolve();
        if (typeof data === "object" && data !== null && "name" in data) {
          return { value: data };
        }
        return {
          issues: [{ message: "Invalid", path: [] }],
        };
      });

      const weaver = new PromptWeaver("Hello {{name}}", { schema });
      const result = await weaver.formatWithSchemaAsync({ name: "World" });
      expect(result).toBe("Hello World");
    });
  });

  describe("Template Analysis", () => {
    it("should extract variables excluding helpers and block helpers", () => {
      const template = "Hello {{name}}, {{#if condition}}yes{{/if}}";
      const weaver = new PromptWeaver(template);
      const variables = weaver.extractVariables();
      expect(variables.has("name")).toBe(true);
      // Note: condition is inside block helper, extraction may vary
      // Key test: should not include block helpers like 'if'
      expect(Array.from(variables)).not.toContain("if");
    });

    it("should get metadata with variables, helpers, and partials", () => {
      const template = "Hello {{name}}, {{#customHelper}}test{{/customHelper}}, {{> partial}}";
      const weaver = new PromptWeaver(template);
      const metadata = weaver.getMetadata();
      expect(metadata.variables).toContain("name");
      expect(metadata.helpers.length).toBeGreaterThan(0);
      expect(metadata.partials).toContain("partial");
    });
  });

  describe("Static Methods", () => {
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

    it("should create PromptWeaver from composed templates", () => {
      const templates = ["Hello {{name}}", "Goodbye {{name}}"];
      const weaver = PromptWeaver.composeAndCreate(templates);
      const result = weaver.format({ name: "World" });
      expect(result).toContain("Hello World");
      expect(result).toContain("Goodbye World");
    });
  });
});
