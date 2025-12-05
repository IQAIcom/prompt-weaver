import type { StandardSchemaV1 } from "@standard-schema/spec";
import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../../src/core/prompt-weaver.js";

describe("Initialization Feature", () => {
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
});
