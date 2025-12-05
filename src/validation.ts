import Handlebars from "handlebars";

/**
 * Template compilation error with line number context
 */
export class TemplateCompilationError extends Error {
  constructor(
    message: string,
    public readonly lineNumber?: number,
    public readonly columnNumber?: number,
    public readonly source?: string
  ) {
    super(message);
    this.name = "TemplateCompilationError";
    // biome-ignore lint/suspicious/noExplicitAny: Error.captureStackTrace is V8-specific and not in types
    const ErrorConstructor = Error as any;
    if (typeof ErrorConstructor.captureStackTrace === "function") {
      ErrorConstructor.captureStackTrace(this, TemplateCompilationError);
    }
  }

  /**
   * Get a formatted error message with context
   */
  getFormattedMessage(): string {
    let msg = this.message;
    if (this.lineNumber !== undefined) {
      msg += ` (line: ${this.lineNumber}`;
      if (this.columnNumber !== undefined) {
        msg += `, column: ${this.columnNumber}`;
      }
      msg += ")";
    }
    return msg;
  }
}

/**
 * Extract variable names from a template
 * @param templateSource - The template source string
 * @returns Set of variable names found in the template
 */
export function extractVariables(templateSource: string): Set<string> {
  const variables = new Set<string>();
  const regex = /\{\{([^}]+)\}\}/g;
  let match: RegExpExecArray | null = null;

  // biome-ignore lint/suspicious/noAssignInExpressions: regex.exec pattern requires assignment
  while ((match = regex.exec(templateSource)) !== null) {
    const content = match[1].trim();
    // Skip helpers and block helpers
    if (content.startsWith("#") || content.startsWith("/") || content.startsWith("^")) {
      continue;
    }
    // Extract variable name (before any helper or modifier)
    const parts = content.split(/\s+/);
    const variable = parts[0];
    // Skip if it's a helper (starts with @ or is a known helper pattern)
    if (!variable.startsWith("@") && !variable.includes("(")) {
      // Handle nested properties (e.g., user.name)
      const baseVar = variable.split(".")[0];
      if (baseVar && baseVar !== "this") {
        variables.add(baseVar);
      }
    }
  }

  return variables;
}


/**
 * Extract line and column from error message or stack trace
 */
function extractErrorLocation(
  error: Error,
  source?: string
): {
  lineNumber?: number;
  columnNumber?: number;
} {
  const result: { lineNumber?: number; columnNumber?: number } = {};

  // Try to extract line number from error message
  const lineMatch = error.message.match(/line (\d+)/i) || error.message.match(/Line (\d+)/);
  if (lineMatch) {
    result.lineNumber = Number.parseInt(lineMatch[1], 10);
  }

  // Try to extract column number
  const colMatch = error.message.match(/column (\d+)/i) || error.message.match(/Column (\d+)/);
  if (colMatch) {
    result.columnNumber = Number.parseInt(colMatch[1], 10);
  }

  // Try to extract from stack trace
  if (!result.lineNumber && error.stack) {
    const stackMatch = error.stack.match(/\(.*:(\d+):(\d+)\)/);
    if (stackMatch) {
      result.lineNumber = Number.parseInt(stackMatch[1], 10);
      result.columnNumber = Number.parseInt(stackMatch[2], 10);
    }
  }

  return result;
}

/**
 * Validate template syntax
 * @param templateSource - The template source string
 * @returns Validation result with errors if any
 */
export function validateTemplate(templateSource: string): {
  valid: boolean;
  errors: TemplateCompilationError[];
} {
  const errors: TemplateCompilationError[] = [];

  try {
    Handlebars.compile(templateSource);
  } catch (error) {
    if (error instanceof Error) {
      const location = extractErrorLocation(error, templateSource);
      errors.push(
        new TemplateCompilationError(
          error.message,
          location.lineNumber,
          location.columnNumber,
          templateSource
        )
      );
    } else {
      errors.push(
        new TemplateCompilationError(String(error), undefined, undefined, templateSource)
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
