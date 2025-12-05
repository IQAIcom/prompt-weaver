import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * Create a mock Standard Schema validator for testing
 */
export function createMockSchema(
  validateFn: (data: unknown) => { value?: unknown; issues?: StandardSchemaV1.Issue[] }
): StandardSchemaV1 {
  return {
    "~standard": {
      version: 1,
      vendor: "test",
      validate: validateFn,
    },
  } as StandardSchemaV1;
}

/**
 * Create a mock async Standard Schema validator for testing
 */
export function createMockAsyncSchema(
  validateFn: (data: unknown) => Promise<{ value?: unknown; issues?: StandardSchemaV1.Issue[] }>
): StandardSchemaV1 {
  return {
    "~standard": {
      version: 1,
      vendor: "test-async",
      validate: validateFn,
    },
  } as StandardSchemaV1;
}
