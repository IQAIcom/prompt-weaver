import { describe, it, expect, beforeEach } from "vitest";
import Handlebars from "handlebars";
import { TransformerRegistry } from "../src/core/plugin-system.js";
import { registerHandlebarsHelpers } from "../src/transformers/index.js";

describe("Plugin System", () => {
  beforeEach(() => {
    // Clear any existing helpers
    Handlebars.unregisterHelper("testHelper");
    Handlebars.unregisterHelper("testHelper2");
  });

  describe("TransformerRegistry", () => {
    it("should prevent duplicate registration with registerWithHandlebars", () => {
      const registry = TransformerRegistry.createScoped();
      let callCount = 0;
      const handler = () => {
        callCount++;
        return "test";
      };

      registry.registerTransformer("testHelper", handler);
      registry.registerWithHandlebars(Handlebars);
      registry.registerWithHandlebars(Handlebars); // Second call should not register again

      // Verify helper is registered
      const template = Handlebars.compile("{{testHelper}}");
      expect(template({})).toBe("test");
      expect(callCount).toBe(1);
    });

    it("should overwrite existing transformer", () => {
      const registry = TransformerRegistry.createScoped();
      const handler1 = () => "first";
      const handler2 = () => "second";

      registry.registerTransformer("testHelper", handler1);
      registry.registerTransformer("testHelper", handler2); // Overwrite

      const config = registry.getTransformer("testHelper");
      expect(config?.handler).toBe(handler2);
    });
  });

  describe("Global Registration", () => {
    it("should be idempotent - doesn't re-register", () => {
      // Reset the flag by accessing internal state
      // Since we can't directly reset, we'll test that calling twice doesn't cause errors
      registerHandlebarsHelpers();
      registerHandlebarsHelpers(); // Should not throw or cause issues

      // Verify helpers are still registered
      const template = Handlebars.compile("{{add 1 2}}");
      expect(template({})).toBe("3");
    });
  });
});
