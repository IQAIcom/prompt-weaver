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
 * Extract base variable name from a PathExpression in the AST
 * Handles nested properties (e.g., user.profile.name -> user)
 */
function extractBaseVariable(node: hbs.AST.Node): string | null {
  // Only process PathExpression nodes
  if (node.type !== "PathExpression") {
    return null;
  }

  const path = node as hbs.AST.PathExpression;

  // Skip special variables (starts with @) or 'this'
  if (path.data || path.parts[0] === "this") {
    return null;
  }

  // Return the base variable (first part of the path)
  const baseVar = path.parts[0];
  return baseVar || null;
}

/**
 * Custom AST visitor for extracting variables from a Handlebars template
 */
class VariableExtractorVisitor extends Handlebars.Visitor {
  variables = new Set<string>();

  // Visit MustacheStatement nodes (e.g., {{name}}, {{helper arg}})
  MustacheStatement(mustache: hbs.AST.MustacheStatement): void {
    // If there are parameters, the path is a helper name, not a variable
    // Extract variables only from the parameters
    if (mustache.params && mustache.params.length > 0) {
      // Path is a helper name, extract variables from parameters only
      for (const param of mustache.params) {
        const paramVar = extractBaseVariable(param);
        if (paramVar) {
          this.variables.add(paramVar);
        }
      }
    } else {
      // No parameters, the path itself is a variable reference
      const baseVar = extractBaseVariable(mustache.path);
      if (baseVar) {
        this.variables.add(baseVar);
      }
    }

    // Continue traversal
    super.MustacheStatement(mustache);
  }

  // Visit BlockStatement nodes (e.g., {{#if}}, {{#each}})
  BlockStatement(block: hbs.AST.BlockStatement): void {
    // Extract variables from block parameters (not the helper name itself)
    if (block.params) {
      for (const param of block.params) {
        const paramVar = extractBaseVariable(param);
        if (paramVar) {
          this.variables.add(paramVar);
        }
      }
    }

    // Continue traversal to visit nested content
    super.BlockStatement(block);
  }
}

/**
 * Extract base variable from bracket notation (e.g., items[0] -> items)
 * This handles edge cases where templates use bracket notation that's not standard Handlebars
 */
function extractVariableFromBracketNotation(expr: string): string | null {
  // Match patterns like items[0] or user[id]
  const arrayMatch = expr.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\[/);
  if (arrayMatch) {
    return arrayMatch[1];
  }

  // Extract base variable from dotted paths (items.0.name -> items)
  const baseVar = expr.split(/[.[]/)[0];
  if (baseVar && baseVar !== "this" && !baseVar.startsWith("@")) {
    return baseVar;
  }

  return null;
}

/**
 * Fallback regex-based extraction for templates that don't parse as valid Handlebars
 * This handles edge cases like bracket notation (items[0]) that aren't standard Handlebars syntax
 */
function extractVariablesFallback(templateSource: string): Set<string> {
  const variables = new Set<string>();
  const regex = /\{\{([^}]+)\}\}/g;
  let match: RegExpExecArray | null = null;

  // biome-ignore lint/suspicious/noAssignInExpressions: regex.exec pattern requires assignment
  while ((match = regex.exec(templateSource)) !== null) {
    const content = match[1].trim();

    // Skip block helpers and closing tags
    if (content.startsWith("#") || content.startsWith("/") || content.startsWith("^")) {
      continue;
    }

    // Skip partials
    if (content.startsWith(">")) {
      continue;
    }

    // Extract first token (might be helper or variable)
    const parts = content.split(/\s+/);
    const firstToken = parts[0];

    // For helpers with arguments (e.g., "currency balance"), extract the argument
    if (parts.length > 1 && !firstToken.includes(".") && !firstToken.includes("[")) {
      // First token is likely a helper, extract variable from arguments
      for (let i = 1; i < parts.length; i++) {
        const arg = parts[i];
        // Skip string literals
        if (
          (arg.startsWith('"') && arg.endsWith('"')) ||
          (arg.startsWith("'") && arg.endsWith("'"))
        ) {
          continue;
        }
        const variable = extractVariableFromBracketNotation(arg);
        if (variable) {
          variables.add(variable);
        }
      }
    } else {
      // Direct variable reference or dotted path
      const variable = extractVariableFromBracketNotation(firstToken);
      if (variable) {
        variables.add(variable);
      }
    }
  }

  return variables;
}

/**
 * Extract variable names from a template using Handlebars AST
 * Handles nested properties, array access, helper expressions, and variables in conditionals
 * @param templateSource - The template source string
 * @returns Set of variable names found in the template
 */
export function extractVariables(templateSource: string): Set<string> {
  try {
    // Parse the template into an AST
    const ast = Handlebars.parse(templateSource);

    // Create a visitor to extract variables
    const visitor = new VariableExtractorVisitor();

    // Traverse the AST
    visitor.accept(ast);

    return visitor.variables;
  } catch {
    // If parsing fails (e.g., due to bracket notation), fall back to regex-based extraction
    // This handles edge cases while still benefiting from AST for valid templates
    return extractVariablesFallback(templateSource);
  }
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
