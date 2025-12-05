import Handlebars from "handlebars";
import { beforeEach, describe, expect, it } from "vitest";
import { PromptWeaver } from "../../../src/prompt-weaver.js";
import { registerArithmeticHelpers } from "../../../src/transformers/arithmetic.js";

describe("Arithmetic Transformers Feature", () => {
  beforeEach(() => {
    Handlebars.unregisterHelper("divide");
    registerArithmeticHelpers();
  });

  it("should handle division by zero", () => {
    const template = "{{divide a b}}";
    const weaver = new PromptWeaver(template);
    expect(weaver.format({ a: 10, b: 0 })).toBe("0");
    expect(weaver.format({ a: 5, b: 2 })).toBe("2.5");
  });
});
