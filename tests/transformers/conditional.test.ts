import { describe, it, expect, beforeEach } from "vitest";
import Handlebars from "handlebars";
import { registerConditionalHelpers } from "../../src/transformers/conditional.js";
import { PromptWeaver } from "../../src/prompt-weaver.js";

describe("Conditional Transformers", () => {
  beforeEach(() => {
    Handlebars.unregisterHelper("switch");
    Handlebars.unregisterHelper("case");
    registerConditionalHelpers();
  });

  it("should handle switch/case block helper interaction", () => {
    const template = `{{#switch value}}{{#case "a"}}Option A{{/case}}{{#case "b"}}Option B{{/case}}{{/switch}}`;
    const weaver = new PromptWeaver(template);
    expect(weaver.format({ value: "a" })).toBe("Option A");
    expect(weaver.format({ value: "b" })).toBe("Option B");
    expect(weaver.format({ value: "c" })).toBe("");
  });
});

