/**
 * Schema validation utilities for prompt-weaver
 * Integrates Standard Schema (https://standardschema.dev) with template validation
 *
 * Works with Zod 3.24+, Valibot 1.0+, ArkType 2.0+, and other spec-compliant libraries.
 */

import type { StandardSchemaV1 } from "@standard-schema/spec";

// Re-export the type for convenience
export type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Check if a value is a Standard Schema compatible validator
 *
 * @param value - Value to check
 * @returns True if the value implements StandardSchemaV1
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { isStandardSchema } from '@iqai/prompt-weaver';
 *
 * const schema = z.string();
 * console.log(isStandardSchema(schema)); // true
 *
 * console.log(isStandardSchema({ foo: 'bar' })); // false
 * ```
 */
export function isStandardSchema(value: unknown): value is StandardSchemaV1 {
  return (
    typeof value === "object" &&
    value !== null &&
    "~standard" in value &&
    typeof (value as StandardSchemaV1)["~standard"] === "object" &&
    (value as StandardSchemaV1)["~standard"] !== null &&
    typeof (value as StandardSchemaV1)["~standard"].validate === "function" &&
    (value as StandardSchemaV1)["~standard"].version === 1
  );
}

/**
 * Schema validation error with detailed issue information
 */
export class SchemaValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: ReadonlyArray<StandardSchemaV1.Issue>,
    public readonly vendor?: string
  ) {
    super(message);
    this.name = "SchemaValidationError";
    // biome-ignore lint/suspicious/noExplicitAny: Error.captureStackTrace is V8-specific
    const ErrorConstructor = Error as any;
    if (typeof ErrorConstructor.captureStackTrace === "function") {
      ErrorConstructor.captureStackTrace(this, SchemaValidationError);
    }
  }

  /**
   * Get a formatted error message with all issues
   */
  getFormattedMessage(): string {
    const issueMessages = this.issues.map((issue) => {
      const path = formatIssuePath(issue.path);
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    return `Schema validation failed:\n  - ${issueMessages.join("\n  - ")}`;
  }
}

/**
 * Format the path of a validation issue into a readable string
 */
function formatIssuePath(
  path: ReadonlyArray<PropertyKey | StandardSchemaV1.PathSegment> | undefined
): string {
  if (!path || path.length === 0) return "";

  return path
    .map((segment) => {
      if (typeof segment === "object" && segment !== null && "key" in segment) {
        return String(segment.key);
      }
      return String(segment);
    })
    .join(".");
}

/**
 * Result of schema validation
 */
export interface SchemaValidationResult<T> {
  /** Whether validation succeeded */
  success: boolean;
  /** The validated and transformed data (if successful) */
  data?: T;
  /** Validation issues (if failed) */
  issues?: ReadonlyArray<StandardSchemaV1.Issue>;
  /** The vendor name of the schema library used */
  vendor?: string;
}

/**
 * Validate data against a Standard Schema compatible validator (synchronous)
 *
 * @param schema - A Standard Schema compatible validator (Zod, Valibot, ArkType, etc.)
 * @param data - The data to validate
 * @returns Validation result with typed output
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { validateWithSchema } from '@iqai/prompt-weaver';
 *
 * const schema = z.object({
 *   name: z.string(),
 *   age: z.number().positive(),
 * });
 *
 * const result = validateWithSchema(schema, { name: 'Alice', age: 30 });
 * if (result.success) {
 *   console.log(result.data); // { name: 'Alice', age: 30 }
 * }
 * ```
 */
export function validateWithSchema<T extends StandardSchemaV1>(
  schema: T,
  data: unknown
): SchemaValidationResult<StandardSchemaV1.InferOutput<T>> {
  if (!isStandardSchema(schema)) {
    throw new Error(
      "Invalid schema: expected a Standard Schema compatible validator. " +
        "Ensure you're using a compatible library (Zod 3.24+, Valibot 1.0+, ArkType 2.0+, etc.)"
    );
  }

  const result = schema["~standard"].validate(data);

  // Check if the result is a Promise (async validation)
  if (result instanceof Promise) {
    throw new Error(
      "Async validation detected. Use validateWithSchemaAsync() for async validators."
    );
  }

  const vendor = schema["~standard"].vendor;

  if (result.issues) {
    return {
      success: false,
      issues: result.issues,
      vendor,
    };
  }

  return {
    success: true,
    data: result.value as StandardSchemaV1.InferOutput<T>,
    vendor,
  };
}

/**
 * Validate data against a Standard Schema compatible validator (async)
 *
 * @param schema - A Standard Schema compatible validator
 * @param data - The data to validate
 * @returns Promise resolving to validation result with typed output
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { validateWithSchemaAsync } from '@iqai/prompt-weaver';
 *
 * const schema = z.object({
 *   email: z.string().email().refine(async (email) => {
 *     // Some async validation
 *     return await checkEmailExists(email);
 *   }),
 * });
 *
 * const result = await validateWithSchemaAsync(schema, { email: 'test@example.com' });
 * ```
 */
export async function validateWithSchemaAsync<T extends StandardSchemaV1>(
  schema: T,
  data: unknown
): Promise<SchemaValidationResult<StandardSchemaV1.InferOutput<T>>> {
  if (!isStandardSchema(schema)) {
    throw new Error(
      "Invalid schema: expected a Standard Schema compatible validator. " +
        "Ensure you're using a compatible library (Zod 3.24+, Valibot 1.0+, ArkType 2.0+, etc.)"
    );
  }

  let result = schema["~standard"].validate(data);

  // Handle both sync and async results
  if (result instanceof Promise) {
    result = await result;
  }

  const vendor = schema["~standard"].vendor;

  if (result.issues) {
    return {
      success: false,
      issues: result.issues,
      vendor,
    };
  }

  return {
    success: true,
    data: result.value as StandardSchemaV1.InferOutput<T>,
    vendor,
  };
}

/**
 * Parse and validate data with a Standard Schema, throwing on error (synchronous)
 *
 * @param schema - A Standard Schema compatible validator
 * @param data - The data to parse and validate
 * @returns The validated and transformed data
 * @throws {SchemaValidationError} If validation fails
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { parseWithSchema } from '@iqai/prompt-weaver';
 *
 * const schema = z.object({
 *   name: z.string(),
 *   count: z.number(),
 * });
 *
 * // Returns typed data or throws SchemaValidationError
 * const data = parseWithSchema(schema, userInput);
 * ```
 */
export function parseWithSchema<T extends StandardSchemaV1>(
  schema: T,
  data: unknown
): StandardSchemaV1.InferOutput<T> {
  const result = validateWithSchema(schema, data);

  if (!result.success) {
    throw new SchemaValidationError(
      `Validation failed with ${result.issues?.length ?? 0} issue(s)`,
      result.issues ?? [],
      result.vendor
    );
  }

  return result.data as StandardSchemaV1.InferOutput<T>;
}

/**
 * Parse and validate data with a Standard Schema, throwing on error (async)
 *
 * @param schema - A Standard Schema compatible validator
 * @param data - The data to parse and validate
 * @returns Promise resolving to validated and transformed data
 * @throws {SchemaValidationError} If validation fails
 */
export async function parseWithSchemaAsync<T extends StandardSchemaV1>(
  schema: T,
  data: unknown
): Promise<StandardSchemaV1.InferOutput<T>> {
  const result = await validateWithSchemaAsync(schema, data);

  if (!result.success) {
    throw new SchemaValidationError(
      `Validation failed with ${result.issues?.length ?? 0} issue(s)`,
      result.issues ?? [],
      result.vendor
    );
  }

  return result.data as StandardSchemaV1.InferOutput<T>;
}

/**
 * Create a safe parser that returns undefined instead of throwing
 *
 * @param schema - A Standard Schema compatible validator
 * @returns A function that parses data and returns undefined on failure
 *
 * @example
 * ```ts
 * import { z } from 'zod';
 * import { createSafeParser } from '@iqai/prompt-weaver';
 *
 * const parseUser = createSafeParser(z.object({
 *   name: z.string(),
 *   age: z.number(),
 * }));
 *
 * const user = parseUser(unknownData);
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 */
export function createSafeParser<T extends StandardSchemaV1>(
  schema: T
): (data: unknown) => StandardSchemaV1.InferOutput<T> | undefined {
  return (data: unknown) => {
    const result = validateWithSchema(schema, data);
    return result.success ? result.data : undefined;
  };
}

/**
 * Type guard to check if a validation result is successful
 */
export function isValidationSuccess<T>(
  result: SchemaValidationResult<T>
): result is SchemaValidationResult<T> & { success: true; data: T } {
  return result.success && result.data !== undefined;
}

/**
 * Get a human-readable description of validation issues
 */
export function formatValidationIssues(issues: ReadonlyArray<StandardSchemaV1.Issue>): string {
  return issues
    .map((issue, index) => {
      const path = formatIssuePath(issue.path);
      const location = path ? ` at "${path}"` : "";
      return `${index + 1}. ${issue.message}${location}`;
    })
    .join("\n");
}
