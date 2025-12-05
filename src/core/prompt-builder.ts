import type { StandardSchemaV1 } from "@standard-schema/spec";
import { PromptWeaver, type PromptWeaverOptions } from "./prompt-weaver.js";

/**
 * Fluent API builder for programmatically constructing prompts
 */
export class PromptBuilder {
  private sections: string[] = [];
  private currentSection: string[] = [];

  /**
   * Add a section to the prompt
   * @param title - Optional section title
   * @param content - Section content (can be a function for conditional content)
   */
  section(title?: string, content?: string | (() => string)): this {
    if (this.currentSection.length > 0) {
      this.sections.push(this.currentSection.join("\n"));
      this.currentSection = [];
    }

    if (title) {
      this.currentSection.push(`## ${title}`);
    }

    if (content) {
      const contentStr = typeof content === "function" ? content() : content;
      if (contentStr) {
        this.currentSection.push(contentStr);
      }
    }

    return this;
  }

  /**
   * Add a code block
   * @param code - Code content
   * @param language - Optional language identifier
   */
  code(code: string, language?: string): this {
    const lang = language ? language : "";
    this.currentSection.push(`\`\`\`${lang}\n${code}\n\`\`\``);
    return this;
  }

  /**
   * Add a list
   * @param items - Array of list items
   * @param ordered - Whether to use ordered list (default: false)
   */
  list(items: string[], ordered = false): this {
    if (items.length === 0) return this;

    const listItems = items.map((item, index) => {
      if (ordered) {
        return `${index + 1}. ${item}`;
      }
      return `- ${item}`;
    });

    this.currentSection.push(listItems.join("\n"));
    return this;
  }

  /**
   * Add a table
   * @param headers - Table headers
   * @param rows - Table rows (array of arrays)
   */
  table(headers: string[], rows: string[][]): this {
    if (headers.length === 0) return this;

    // Create markdown table
    const headerRow = `| ${headers.join(" | ")} |`;
    const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
    const dataRows = rows.map((row) => `| ${row.join(" | ")} |`);

    this.currentSection.push([headerRow, separatorRow, ...dataRows].join("\n"));
    return this;
  }

  /**
   * Add conditional content
   * @param condition - Condition to evaluate
   * @param ifTrue - Content if condition is true
   * @param ifFalse - Optional content if condition is false
   */
  conditional(condition: boolean, ifTrue: string, ifFalse?: string): this {
    if (condition) {
      this.currentSection.push(ifTrue);
    } else if (ifFalse) {
      this.currentSection.push(ifFalse);
    }
    return this;
  }

  /**
   * Add a loop/iteration
   * @param items - Items to iterate over
   * @param callback - Function to generate content for each item
   */
  loop<T>(items: T[], callback: (item: T, index: number) => string): this {
    const loopContent = items.map(callback).join("\n");
    if (loopContent) {
      this.currentSection.push(loopContent);
    }
    return this;
  }

  /**
   * Add raw text content
   * @param text - Text content to add
   */
  text(text: string): this {
    if (text) {
      this.currentSection.push(text);
    }
    return this;
  }

  /**
   * Add a separator/divider
   * @param char - Character to use for separator (default: "---")
   */
  separator(char = "---"): this {
    this.currentSection.push(char);
    return this;
  }

  /**
   * Add a horizontal rule (alias for separator)
   * @param char - Character to use for separator (default: "---")
   */
  horizontalRule(char = "---"): this {
    return this.separator(char);
  }

  /**
   * Add a heading
   * @param level - Heading level (1-6)
   * @param text - Heading text
   */
  heading(level: number, text: string): this {
    const hashes = "#".repeat(Math.min(Math.max(level, 1), 6));
    this.currentSection.push(`${hashes} ${text}`);
    return this;
  }

  /**
   * Add a blockquote
   * @param text - Quote text
   */
  quote(text: string): this {
    const lines = text.split("\n");
    const quotedLines = lines.map((line) => `> ${line}`);
    this.currentSection.push(quotedLines.join("\n"));
    return this;
  }

  /**
   * Add formatted JSON content
   * @param data - Data to format as JSON
   * @param indent - Number of spaces for indentation (default: 2)
   */
  json(data: unknown, indent = 2): this {
    try {
      const jsonStr = JSON.stringify(data, null, indent);
      this.currentSection.push(`\`\`\`json\n${jsonStr}\n\`\`\``);
    } catch {
      // If JSON.stringify fails, add as plain text
      this.currentSection.push(String(data));
    }
    return this;
  }

  /**
   * Add a markdown link
   * @param text - Link text
   * @param url - Link URL
   */
  link(text: string, url: string): this {
    this.currentSection.push(`[${text}](${url})`);
    return this;
  }

  /**
   * Add a markdown image
   * @param alt - Alt text for the image
   * @param url - Image URL
   * @param title - Optional title for the image
   */
  image(alt: string, url: string, title?: string): this {
    const titlePart = title ? ` "${title}"` : "";
    this.currentSection.push(`![${alt}](${url}${titlePart})`);
    return this;
  }

  /**
   * Add a checkbox/task list item
   * @param text - Checkbox text
   * @param checked - Whether the checkbox is checked (default: false)
   */
  checkbox(text: string, checked = false): this {
    const mark = checked ? "[x]" : "[ ]";
    this.currentSection.push(`${mark} ${text}`);
    return this;
  }

  /**
   * Add multiple checkboxes/task list items
   * @param items - Array of checkbox items (can be strings or objects with text and checked properties)
   */
  checkboxes(items: Array<string | { text: string; checked?: boolean }>): this {
    if (items.length === 0) return this;

    const checkboxItems = items.map((item) => {
      if (typeof item === "string") {
        return `[ ] ${item}`;
      }
      const mark = item.checked ? "[x]" : "[ ]";
      return `${mark} ${item.text}`;
    });

    this.currentSection.push(checkboxItems.join("\n"));
    return this;
  }

  /**
   * Build the final prompt string
   * @returns The constructed prompt
   */
  build(): string {
    if (this.currentSection.length > 0) {
      this.sections.push(this.currentSection.join("\n"));
      this.currentSection = [];
    }
    return this.sections.join("\n\n");
  }

  /**
   * Build and create a PromptWeaver instance
   * @param options - Options for PromptWeaver
   * @returns PromptWeaver instance with proper type inference from schema
   *
   * Note: Since PromptBuilder constructs templates dynamically, automatic type inference
   * from the template is not available. Use a schema for type safety, or use
   * `new PromptWeaver(template as const)` with a literal template string.
   */
  toPromptWeaver<TSchema extends StandardSchemaV1 = StandardSchemaV1>(
    options?: PromptWeaverOptions<TSchema>
  ): PromptWeaver<string, TSchema> {
    const template = this.build();
    return new PromptWeaver<string, TSchema>(template, options);
  }

  /**
   * Validate the built prompt (requires PromptWeaver)
   * @param data - Data to validate against
   * @param options - Options for PromptWeaver
   * @returns Validation result
   */

  /**
   * Clear all content
   */
  clear(): this {
    this.sections = [];
    this.currentSection = [];
    return this;
  }
}
