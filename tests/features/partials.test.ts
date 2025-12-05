import { describe, expect, it } from "vitest";
import { PromptWeaver } from "../../src/core/prompt-weaver.js";

describe("Partials Feature", () => {
  describe("Registration via Options", () => {
    it("should render template with partials registered via options", () => {
      const template = "{{> header}}\nMain content: {{content}}\n{{> footer}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          header: "# {{title}}\n",
          footer: "\n---\nFooter",
        },
      });

      const result = weaver.format({
        title: "My Page",
        content: "Hello World",
      });

      expect(result).toContain("# My Page");
      expect(result).toContain("Main content: Hello World");
      expect(result).toContain("---\nFooter");
    });
  });

  describe("Programmatic Registration", () => {
    it("should render template with partials registered programmatically", () => {
      const template = "{{> header}}\n{{content}}";
      const weaver = new PromptWeaver(template);
      weaver.setPartial("header", "# {{title}}\n");

      const result = weaver.format({
        title: "Test",
        content: "Body",
      });

      expect(result).toBe("# Test\nBody");
    });
  });

  describe("Context Access", () => {
    it("should allow partials to access parent template context", () => {
      const template = "{{> userCard}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          userCard: "Name: {{name}}, Email: {{email}}",
        },
      });

      const result = weaver.format({
        name: "Alice",
        email: "alice@example.com",
      });

      expect(result).toBe("Name: Alice, Email: alice@example.com");
    });
  });

  describe("Nested Partials", () => {
    it("should support nested partials", () => {
      const template = "{{> wrapper}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          wrapper: "{{> header}}\n{{content}}\n{{> footer}}",
          header: "# {{title}}",
          footer: "---",
        },
      });

      const result = weaver.format({
        title: "Page",
        content: "Body",
      });

      expect(result).toContain("# Page");
      expect(result).toContain("Body");
      expect(result).toContain("---");
    });
  });

  describe("Metadata", () => {
    it("should include partials in metadata", () => {
      const template = "{{> header}} {{content}} {{> footer}}";
      const weaver = new PromptWeaver(template, {
        partials: {
          header: "Header",
          footer: "Footer",
        },
      });

      const metadata = weaver.getMetadata();
      expect(metadata.partials).toContain("header");
      expect(metadata.partials).toContain("footer");
    });
  });
});
