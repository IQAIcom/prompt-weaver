import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { TransformerRegistry } from "../../src/core/plugin-system.js";
import { PromptWeaver } from "../../src/prompt-weaver.js";
import { registerTransformer } from "../../src/transformers/index.js";

describe("Transformer Usage Feature", () => {
  beforeEach(() => {
    // Clean up any registered helpers
    Handlebars.unregisterHelper("testHelper");
    Handlebars.unregisterHelper("customFormat");
    Handlebars.unregisterHelper("scopedHelper");
    Handlebars.unregisterHelper("globalHelper");
    Handlebars.unregisterHelper("helper1");
    Handlebars.unregisterHelper("helper2");
  });

  describe("Global Transformers", () => {
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
  });

  describe("Scoped Transformers", () => {
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
});

