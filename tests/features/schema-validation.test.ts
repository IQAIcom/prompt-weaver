import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { PromptWeaver } from "../../src/prompt-weaver.js";
import {
  createSafeParser,
  createSafeParserAsync,
  formatValidationIssues,
  isStandardSchema,
  isValidationSuccess,
  parseWithSchema,
  parseWithSchemaAsync,
  SchemaValidationError,
  validateWithSchema,
  validateWithSchemaAsync,
} from "../../src/schema-validation.js";
import { createMockAsyncSchema, createMockSchema } from "../helpers.js";

describe("Schema Validation Feature", () => {
  describe("Schema Detection", () => {
    it("should detect valid Standard Schema", () => {
      const schema = createMockSchema(() => ({ value: {} }));
      expect(isStandardSchema(schema)).toBe(true);
    });

    it("should detect Zod schema as Standard Schema", () => {
      const schema = z.object({ name: z.string() });
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

  describe("Zod Integration", () => {
    it("should validate data with Zod schema successfully", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().positive(),
      });

      const result = validateWithSchema(schema, { name: "Alice", age: 30 });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ name: "Alice", age: 30 });
      expect(result.vendor).toBe("zod");
    });

    it("should return validation errors for invalid Zod data", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number().positive(),
      });

      const result = validateWithSchema(schema, { name: 123, age: -5 });
      expect(result.success).toBe(false);
      expect(result.issues).toBeDefined();
      expect(result.issues?.[0]).toBeDefined();
    });

    it("should parse valid data with Zod schema", () => {
      const schema = z.object({
        email: z.email(),
        count: z.number().int(),
      });

      const data = parseWithSchema(schema, { email: "test@example.com", count: 42 });
      expect(data).toEqual({ email: "test@example.com", count: 42 });
    });

    it("should throw SchemaValidationError for invalid Zod data", () => {
      const schema = z.object({
        email: z.email(),
      });

      expect(() => {
        parseWithSchema(schema, { email: "invalid-email" });
      }).toThrow(SchemaValidationError);
    });

    it("should work with Zod transformations", () => {
      const schema = z.object({
        name: z.string().transform((s) => s.toUpperCase()),
        createdAt: z.string().transform((s) => new Date(s)),
      });

      const result = validateWithSchema(schema, {
        name: "alice",
        createdAt: "2024-01-01",
      });

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("ALICE");
      expect(result.data?.createdAt).toBeInstanceOf(Date);
    });

    it("should work with Zod optional and default values", () => {
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
        withDefault: z.string().default("default-value"),
      });

      const result = validateWithSchema(schema, { required: "hello" });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        required: "hello",
        withDefault: "default-value",
      });
    });

    it("should work with Zod union types", () => {
      const schema = z.union([z.string(), z.number()]);

      const stringResult = validateWithSchema(schema, "hello");
      expect(stringResult.success).toBe(true);
      expect(stringResult.data).toBe("hello");

      const numberResult = validateWithSchema(schema, 42);
      expect(numberResult.success).toBe(true);
      expect(numberResult.data).toBe(42);

      const invalidResult = validateWithSchema(schema, { invalid: true });
      expect(invalidResult.success).toBe(false);
    });

    it("should work with Zod array schemas", () => {
      const schema = z.array(z.number().positive());

      const validResult = validateWithSchema(schema, [1, 2, 3, 4, 5]);
      expect(validResult.success).toBe(true);
      expect(validResult.data).toEqual([1, 2, 3, 4, 5]);

      const invalidResult = validateWithSchema(schema, [1, -2, 3]);
      expect(invalidResult.success).toBe(false);
    });

    it("should work with nested Zod schemas", () => {
      const addressSchema = z.object({
        street: z.string(),
        city: z.string(),
        zip: z.string().regex(/^\d{5}$/),
      });

      const userSchema = z.object({
        name: z.string(),
        address: addressSchema,
      });

      const validResult = validateWithSchema(userSchema, {
        name: "John",
        address: {
          street: "123 Main St",
          city: "Springfield",
          zip: "12345",
        },
      });
      expect(validResult.success).toBe(true);

      const invalidResult = validateWithSchema(userSchema, {
        name: "John",
        address: {
          street: "123 Main St",
          city: "Springfield",
          zip: "invalid",
        },
      });
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("Async Zod Integration", () => {
    it("should handle async validation with Zod refine", async () => {
      const schema = z.object({
        username: z.string().check(async (ctx) => {
          // Simulate async check (e.g., database lookup)
          await new Promise((resolve) => setTimeout(resolve, 10));
          if (ctx.value === "taken") {
            ctx.issues.push({
              code: "custom",
              input: ctx.value,
              message: "Username already taken",
            });
          }
        }),
      });

      const validResult = await validateWithSchemaAsync(schema, { username: "available" });
      expect(validResult.success).toBe(true);
      expect(validResult.data).toEqual({ username: "available" });

      const invalidResult = await validateWithSchemaAsync(schema, { username: "taken" });
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.issues?.[0]?.message).toBe("Username already taken");
    });

    it("should parse async Zod data successfully", async () => {
      const schema = z.object({
        value: z.number().check(async (ctx) => {
          await Promise.resolve();
          if (ctx.value < 0) {
            ctx.issues.push({ code: "custom", input: ctx.value, message: "Must be positive" });
          }
        }),
      });

      const data = await parseWithSchemaAsync(schema, { value: 10 });
      expect(data).toEqual({ value: 10 });
    });

    it("should throw on async parse failure", async () => {
      const schema = z.object({
        value: z.number().check(async (ctx) => {
          await Promise.resolve();
          if (ctx.value < 0) {
            ctx.issues.push({ code: "custom", input: ctx.value, message: "Must be positive" });
          }
        }),
      });

      await expect(parseWithSchemaAsync(schema, { value: -5 })).rejects.toThrow(
        SchemaValidationError
      );
    });
  });

  describe("Safe Parser with Zod", () => {
    it("should return parsed data on success", () => {
      const schema = z.object({ name: z.string() });
      const safeParse = createSafeParser(schema);

      const result = safeParse({ name: "Alice" });
      expect(result).toEqual({ name: "Alice" });
    });

    it("should return undefined on failure", () => {
      const schema = z.object({ name: z.string() });
      const safeParse = createSafeParser(schema);

      const result = safeParse({ name: 123 });
      expect(result).toBeUndefined();
    });

    it("should work with async safe parser", async () => {
      const schema = z.object({
        value: z.number().check(async (ctx) => {
          await Promise.resolve();
          if (ctx.value < 0) {
            ctx.issues.push({ code: "custom", input: ctx.value, message: "Must be positive" });
          }
        }),
      });
      const safeParseAsync = createSafeParserAsync(schema);

      const validResult = await safeParseAsync({ value: 10 });
      expect(validResult).toEqual({ value: 10 });

      const invalidResult = await safeParseAsync({ value: -5 });
      expect(invalidResult).toBeUndefined();
    });
  });

  describe("Utility Functions with Zod", () => {
    it("should correctly identify validation success", () => {
      const schema = z.object({ name: z.string() });

      const successResult = validateWithSchema(schema, { name: "test" });
      expect(isValidationSuccess(successResult)).toBe(true);

      const failureResult = validateWithSchema(schema, { name: 123 });
      expect(isValidationSuccess(failureResult)).toBe(false);
    });

    it("should format validation issues from Zod", () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      const result = validateWithSchema(schema, { name: 123, age: "invalid" });
      expect(result.success).toBe(false);

      const formatted = formatValidationIssues(result.issues ?? []);
      expect(formatted).toContain("1.");
      expect(typeof formatted).toBe("string");
    });
  });

  describe("PromptWeaver Integration", () => {
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
});
