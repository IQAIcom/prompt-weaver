import { describe, expect, it } from "vitest";
import { PromptBuilder } from "../../src/core/prompt-builder.js";
import { PromptWeaver } from "../../src/core/prompt-weaver.js";

describe("Builder Feature", () => {
  describe("Section Management", () => {
    it("should build multiple sections correctly", () => {
      const builder = new PromptBuilder();
      builder.section("Section 1", "Content 1").section("Section 2", "Content 2");
      const result = builder.build();
      expect(result).toContain("## Section 1");
      expect(result).toContain("Content 1");
      expect(result).toContain("## Section 2");
      expect(result).toContain("Content 2");
    });

    it("should combine sections and handle current section", () => {
      const builder = new PromptBuilder();
      builder.text("Current content").section("New Section", "New content");
      const result = builder.build();
      expect(result).toContain("Current content");
      expect(result).toContain("## New Section");
      expect(result).toContain("New content");
    });
  });

  describe("Complex Content Methods", () => {
    it("should format markdown table correctly", () => {
      const builder = new PromptBuilder();
      builder.table(
        ["Name", "Age"],
        [
          ["Alice", "30"],
          ["Bob", "25"],
        ]
      );
      const result = builder.build();
      expect(result).toContain("| Name | Age |");
      expect(result).toContain("| --- | --- |");
      expect(result).toContain("| Alice | 30 |");
      expect(result).toContain("| Bob | 25 |");
    });

    it("should iterate with loop callback", () => {
      const builder = new PromptBuilder();
      builder.loop(["a", "b", "c"], (item, index) => `${index + 1}. ${item}`);
      const result = builder.build();
      expect(result).toContain("1. a");
      expect(result).toContain("2. b");
      expect(result).toContain("3. c");
    });
  });

  describe("Integration", () => {
    it("should create PromptWeaver from builder", () => {
      const builder = new PromptBuilder();
      builder.section("Test", "Hello {{name}}");
      const weaver = builder.toPromptWeaver();
      expect(weaver).toBeInstanceOf(PromptWeaver);
      const result = weaver.format({ name: "World" });
      expect(result).toContain("Hello World");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty builder", () => {
      const builder = new PromptBuilder();
      expect(builder.build()).toBe("");
    });

    it("should handle builder with only separators", () => {
      const builder = new PromptBuilder().separator().separator();
      const result = builder.build();
      expect(result.split("---").length).toBeGreaterThan(1);
    });

    it("should handle json() with circular references gracefully", () => {
      const builder = new PromptBuilder();
      const obj: Record<string, unknown> = { name: "test" };
      obj.self = obj; // Circular reference
      builder.json(obj);
      // Should not throw, but JSON.stringify will fail
      const result = builder.build();
      expect(result).toBeTruthy();
    });

    it("should handle checkbox with empty text", () => {
      const builder = new PromptBuilder();
      builder.checkbox("", true);
      const result = builder.build();
      expect(result).toContain("[x]");
    });
  });
});
