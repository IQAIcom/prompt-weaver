import { describe, it, expect } from "vitest";
import {
  isStandardSchema,
  validateWithSchema,
  validateWithSchemaAsync,
  SchemaValidationError,
  parseWithSchema,
} from "../src/schema-validation.js";
import { createMockSchema, createMockAsyncSchema } from "./helpers.js";
import type { StandardSchemaV1 } from "@standard-schema/spec";

describe("Schema Validation", () => {
  describe("Schema Detection", () => {
    it("should detect valid Standard Schema", () => {
      const schema = createMockSchema(() => ({ value: {} }));
      expect(isStandardSchema(schema)).toBe(true);
    });

    it("should reject invalid objects", () => {
      expect(isStandardSchema({})).toBe(false);
      expect(isStandardSchema(null)).toBe(false);
      expect(isStandardSchema("string")).toBe(false);
      expect(isStandardSchema(123)).toBe(false);
    });
  });

  describe("Validation Functions", () => {
    it("should throw on async schema with validateWithSchema", () => {
      const asyncSchema = createMockAsyncSchema(async () => ({ value: {} }));
      expect(() => {
        validateWithSchema(asyncSchema, {});
      }).toThrow("Async validation detected");
    });

    it("should handle both sync and async schemas with validateWithSchemaAsync", async () => {
      // Test sync schema
      const syncSchema = createMockSchema((data) => ({ value: data }));
      const syncResult = await validateWithSchemaAsync(syncSchema, { name: "test" });
      expect(syncResult.success).toBe(true);
      expect(syncResult.data).toEqual({ name: "test" });

      // Test async schema
      const asyncSchema = createMockAsyncSchema(async (data) => {
        await Promise.resolve();
        return { value: data };
      });
      const asyncResult = await validateWithSchemaAsync(asyncSchema, { name: "test" });
      expect(asyncResult.success).toBe(true);
      expect(asyncResult.data).toEqual({ name: "test" });
    });

    it("should return failure result with issues", () => {
      const schema = createMockSchema(() => ({
        issues: [
          { message: "Error 1", path: ["field1"] },
          { message: "Error 2", path: ["field2"] },
        ],
      }));

      const result = validateWithSchema(schema, {});
      expect(result.success).toBe(false);
      expect(result.issues).toHaveLength(2);
      expect(result.vendor).toBe("test");
    });
  });

  describe("Error Handling", () => {
    it("should format multiple issues correctly in SchemaValidationError", () => {
      const issues = [
        { message: "First error", path: ["field1"] },
        { message: "Second error", path: ["field2"] },
      ];
      const error = new SchemaValidationError(issues, "test-vendor");
      expect(error.message).toContain("First error");
      expect(error.message).toContain("Second error");
      expect(error.vendor).toBe("test-vendor");
    });

    it("should throw SchemaValidationError on validation failure with parseWithSchema", () => {
      const schema = createMockSchema(() => ({
        issues: [{ message: "Invalid", path: [] }],
      }));

      expect(() => {
        parseWithSchema(schema, {});
      }).toThrow(SchemaValidationError);
    });
  });
});
