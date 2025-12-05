/**
 * Error handling utilities for transformers
 * Provides consistent error handling patterns across all transformers
 */

/**
 * Options for transformer error handling
 */
export interface TransformerErrorOptions {
  /** Return value when an error occurs (default: "") */
  defaultValue?: string | null | undefined;
  /** Whether to throw errors instead of returning default value (default: false) */
  throwOnError?: boolean;
}

/**
 * Default error handling options
 */
const DEFAULT_ERROR_OPTIONS: TransformerErrorOptions = {
  defaultValue: "",
  throwOnError: false,
};

/**
 * Handle errors in transformer functions consistently
 * @param fn - Function to execute
 * @param options - Error handling options
 * @returns Result of function or default value on error
 */
export function handleTransformerError<T>(
  fn: () => T,
  options: TransformerErrorOptions = DEFAULT_ERROR_OPTIONS
): T | string | null | undefined {
  try {
    return fn();
  } catch (error) {
    if (options.throwOnError) {
      throw error;
    }
    return options.defaultValue ?? "";
  }
}

/**
 * Safe number conversion with error handling
 * @param value - Value to convert to number
 * @param defaultValue - Default value if conversion fails (default: 0)
 * @returns Number or default value
 */
export function safeNumber(value: unknown, defaultValue = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  const num = Number(value);
  return Number.isNaN(num) ? defaultValue : num;
}

/**
 * Safe string conversion with error handling
 * @param value - Value to convert to string
 * @param defaultValue - Default value if conversion fails (default: "")
 * @returns String or default value
 */
export function safeString(value: unknown, defaultValue = ""): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  try {
    return String(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Safe date conversion with error handling
 * @param value - Value to convert to Date
 * @returns Date object or null if invalid
 */
export function safeDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number" || typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Check if a value is a valid array
 * @param value - Value to check
 * @returns True if value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Check if a value is a valid object (not array, not null)
 * @param value - Value to check
 * @returns True if value is an object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
