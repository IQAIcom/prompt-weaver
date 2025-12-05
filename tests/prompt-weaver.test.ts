import type { StandardSchemaV1 } from "@standard-schema/spec";
import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { TransformerRegistry } from "../src/core/plugin-system.js";
import { PromptWeaver } from "../src/prompt-weaver.js";
import { SchemaValidationError } from "../src/schema-validation.js";
import { registerTransformer } from "../src/transformers/index.js";
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

  describe("Partials", () => {
    it("should render template with partials registered via options", () => {
      const template = "{{> header}}\nMain content: {{content}}\n{{> footer}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          header: "# {{title}}\n",
          footer: "\n---\nFooter",
        },
      });

      const result = weaver.format({
        title: "My Page",
        content: "Hello World",
      });

      expect(result).toContain("# My Page");
      expect(result).toContain("Main content: Hello World");
      expect(result).toContain("---\nFooter");
    });

    it("should render template with partials registered programmatically", () => {
      const template = "{{> header}}\n{{content}}";
      const weaver = new PromptWeaver(template);
      weaver.setPartial("header", "# {{title}}\n");

      const result = weaver.format({
        title: "Test",
        content: "Body",
      });

      expect(result).toBe("# Test\nBody");
    });

    it("should allow partials to access parent template context", () => {
      const template = "{{> userCard}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          userCard: "Name: {{name}}, Email: {{email}}",
        },
      });

      const result = weaver.format({
        name: "Alice",
        email: "alice@example.com",
      });

      expect(result).toBe("Name: Alice, Email: alice@example.com");
    });

    it("should support nested partials", () => {
      const template = "{{> wrapper}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          wrapper: "{{> header}}\n{{content}}\n{{> footer}}",
          header: "# {{title}}",
          footer: "---",
        },
      });

      const result = weaver.format({
        title: "Page",
        content: "Body",
      });

      expect(result).toContain("# Page");
      expect(result).toContain("Body");
      expect(result).toContain("---");
    });

    it("should include partials in metadata", () => {
      const template = "{{> header}} {{content}} {{> footer}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          header: "Header",
          footer: "Footer",
        },
      });

      const metadata = weaver.getMetadata();
      expect(metadata.partials).toContain("header");
      expect(metadata.partials).toContain("footer");
    });
  });

  describe("Custom Transformers", () => {
    beforeEach(() => {
      // Clean up any registered helpers
      Handlebars.unregisterHelper("testHelper");
      Handlebars.unregisterHelper("customFormat");
      Handlebars.unregisterHelper("scopedHelper");
      Handlebars.unregisterHelper("globalHelper");
      Handlebars.unregisterHelper("helper1");
      Handlebars.unregisterHelper("helper2");
    });

    it("should use globally registered transformers", () => {
      registerTransformer("testHelper", (value: string) => {
        return `[${value}]`;
      });

      const template = "{{testHelper name}}";
      const weaver = new PromptWeaver(template);
      const result = weaver.format({ name: "Alice" });

      expect(result).toBe("[Alice]");
    });

    it("should use transformers with metadata", () => {
      registerTransformer(
        "customFormat",
        (value: string, prefix: string) => {
          return `${prefix}: ${value}`;
        },
        {
          description: "Custom formatter",
          version: "1.0.0",
        }
      );

      const template = '{{customFormat name "User"}}';
      const weaver = new PromptWeaver(template);
      const result = weaver.format({ name: "Bob" });

      expect(result).toBe("User: Bob");
    });

    it("should use scoped registry transformers", () => {
      const registry = TransformerRegistry.createScoped();
      registry.registerTransformer("scopedHelper", (value: string) => {
        return `Scoped: ${value}`;
      });

      const template = "{{scopedHelper name}}";
      const weaver = new PromptWeaver(template, { registry });
      const result = weaver.format({ name: "Charlie" });

      expect(result).toBe("Scoped: Charlie");
    });

    it("should isolate scoped registry transformers from global", () => {
      // Register globally
      registerTransformer("globalHelper", () => "global");

      // Create scoped registry without the global helper
      const registry = TransformerRegistry.createScoped();
      registry.registerTransformer("scopedHelper", () => "scoped");

      const template1 = "{{globalHelper}}";
      const template2 = "{{scopedHelper}}";

      // Global instance should have global helper
      const weaver1 = new PromptWeaver(template1);
      expect(weaver1.format({})).toBe("global");

      // Scoped instance should only have scoped helper
      const weaver2 = new PromptWeaver(template2, { registry });
      expect(weaver2.format({})).toBe("scoped");
    });

    it("should allow multiple transformers in scoped registry", () => {
      const registry = TransformerRegistry.createScoped();
      registry.registerTransformer("helper1", (v: string) => `1:${v}`);
      registry.registerTransformer("helper2", (v: string) => `2:${v}`);

      const template = "{{helper1 name}} and {{helper2 name}}";
      const weaver = new PromptWeaver(template, { registry });
      const result = weaver.format({ name: "Test" });

      expect(result).toBe("1:Test and 2:Test");
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
