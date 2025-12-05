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

    // Add surrounding code context if source is available
    if (this.source && this.lineNumber !== undefined) {
      const lines = this.source.split("\n");
      const lineIndex = this.lineNumber - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const contextLines: string[] = [];
        const start = Math.max(0, lineIndex - 2);
        const end = Math.min(lines.length, lineIndex + 3);

        for (let i = start; i < end; i++) {
          const prefix = i === lineIndex ? ">>> " : "    ";
          const lineNum = String(i + 1).padStart(3, " ");
          contextLines.push(`${prefix}${lineNum} | ${lines[i]}`);
        }

        if (contextLines.length > 0) {
          msg += `\n\nContext:\n${contextLines.join("\n")}`;
        }
      }
    }

    // Add suggestions for common errors
    const suggestions = this.getSuggestions();
    if (suggestions.length > 0) {
      msg += `\n\nSuggestions:\n${suggestions.map((s) => `  - ${s}`).join("\n")}`;
    }

    return msg;
  }

  /**
   * Get suggestions for fixing common template errors
   */
  private getSuggestions(): string[] {
    const suggestions: string[] = [];
    const msg = this.message.toLowerCase();

    if (msg.includes("expecting") && msg.includes("closing")) {
      suggestions.push("Check for unclosed Handlebars tags ({{#if}}, {{#each}}, etc.)");
      suggestions.push(
        "Ensure all block helpers have matching closing tags ({{/if}}, {{/each}}, etc.)"
      );
    }

    if (msg.includes("parse error") || msg.includes("syntax")) {
      suggestions.push("Verify Handlebars syntax is correct");
      suggestions.push("Check for mismatched brackets or quotes");
    }

    if (msg.includes("helper") && msg.includes("not found")) {
      suggestions.push("Ensure the helper is registered before use");
      suggestions.push("Check for typos in helper names");
    }

    if (msg.includes("partial") && msg.includes("not found")) {
      suggestions.push("Register the partial using setPartial() or in options.partials");
      suggestions.push("Check for typos in partial names");
    }

    return suggestions;
  }
}

/**
 * Extract variable name from a Handlebars expression
 * Handles nested properties, array access, and helper arguments
 */
function extractVariableFromExpression(expr: string): string | null {
  // Remove leading/trailing whitespace
  expr = expr.trim();

  // Skip block helpers and closing tags
  if (expr.startsWith("#") || expr.startsWith("/") || expr.startsWith("^")) {
    return null;
  }

  // Handle helper expressions like {{capitalize user.name}} or {{formatDate date "YYYY-MM-DD"}}
  // In Handlebars, helpers can be called with or without parentheses
  // First, check for parenthesized helper calls
  if (expr.includes("(")) {
    // Find the opening parenthesis
    const openParen = expr.indexOf("(");
    const afterParen = expr.slice(openParen + 1).trim();

    // Extract first argument (before comma or closing paren)
    const firstArgEnd = Math.min(
      afterParen.indexOf(",") >= 0 ? afterParen.indexOf(",") : afterParen.length,
      afterParen.indexOf(")") >= 0 ? afterParen.indexOf(")") : afterParen.length
    );
    const firstArg = afterParen.slice(0, firstArgEnd).trim();

    // Remove quotes if it's a string literal
    if (
      (firstArg.startsWith('"') && firstArg.endsWith('"')) ||
      (firstArg.startsWith("'") && firstArg.endsWith("'"))
    ) {
      return null; // String literal, not a variable
    }

    // Process the first argument
    expr = firstArg;
  } else {
    // Handle space-separated helper calls like {{capitalize user.name}}
    // Split by spaces - first token might be helper name, second might be variable
    const parts = expr.split(/\s+/);
    if (parts.length > 1) {
      // Check if first token looks like a helper (no dots, no brackets)
      const firstToken = parts[0];
      if (!firstToken.includes(".") && !firstToken.includes("[") && !firstToken.includes("(")) {
        // Likely a helper name, use the second token as the variable
        expr = parts.slice(1).join(" ");
      }
      // Otherwise, use the first token as the variable
    }
  }

  // Split by spaces to get the first token (now should be the variable)
  const parts = expr.split(/\s+/);
  const variable = parts[0];

  // Skip if it's a special variable (starts with @) or is "this"
  if (variable.startsWith("@") || variable === "this") {
    return null;
  }

  // Handle array access (e.g., items[0] -> items)
  const arrayMatch = variable.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[/);
  if (arrayMatch) {
    return arrayMatch[1];
  }

  // Handle nested properties (e.g., user.profile.name -> user)
  // Also handles array access in nested properties (e.g., items[0].name -> items)
  const baseVar = variable.split(/[.[]/)[0];
  if (baseVar && baseVar !== "this") {
    return baseVar;
  }

  return null;
}

/**
 * Extract variable names from a template
 * Handles nested properties, array access, helper expressions, and variables in conditionals
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

    // Extract variable from the expression
    const variable = extractVariableFromExpression(content);
    if (variable) {
      variables.add(variable);
    }
  }

  return variables;
}

/**
 * Extract line and column from error message or stack trace
 */
function extractErrorLocation(
  error: Error,
  _source?: string
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
