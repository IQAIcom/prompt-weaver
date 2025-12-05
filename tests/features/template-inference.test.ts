import { describe, expect, it } from "vitest";
import {
  createTypedTemplate,
  PromptWeaver,
  type InferTemplateData,
  type TemplateArrays,
  type TemplateVariables,
} from "../../src/index.js";

/**
 * Type-level assertion helper
 * This function doesn't do anything at runtime, but TypeScript will error
 * if the types don't match
 */
function assertType<T>(_value: T): void {
  // Type assertion only - no runtime behavior
}

describe("Template Type Inference", () => {
  describe("InferTemplateData", () => {
    it("should infer simple variables", () => {
      const template = `Hello {{name}}! You are {{age}} years old.` as const;
      type Data = InferTemplateData<typeof template>;

      // Type-level test: this would fail to compile if types don't match
      const validData: Data = { name: "test", age: "25" };
      assertType<{ name: unknown; age: unknown }>(validData);

      expect(validData).toHaveProperty("name");
      expect(validData).toHaveProperty("age");
    });

    it("should infer array types from {{#each}}", () => {
      const template = `{{#each items}}{{title}} - {{price}}{{/each}}` as const;
      type Data = InferTemplateData<typeof template>;

      const validData: Data = {
        items: [{ title: "Item 1", price: 10 }],
      };

      assertType<{ items: Array<{ title: unknown; price: unknown }> }>(validData);
      expect(validData.items).toBeInstanceOf(Array);
    });

    it("should handle mixed variables and arrays", () => {
      const template = `
        User: {{username}}
        {{#each orders}}
          Order: {{orderId}}
        {{/each}}
      ` as const;
      type Data = InferTemplateData<typeof template>;

      const validData: Data = {
        username: "john",
        orders: [{ orderId: "123" }],
      };

      expect(validData).toHaveProperty("username");
      expect(validData).toHaveProperty("orders");
      expect(validData.orders).toBeInstanceOf(Array);
    });

    it("should extract base variable from nested paths", () => {
      const template = `{{user.name}} - {{user.email}}` as const;
      type Vars = TemplateVariables<typeof template>;

      // Should have "user" as the base variable
      const vars: Vars[] = ["user"];
      expect(vars).toContain("user");
    });
  });

  describe("TemplateVariables", () => {
    it("should extract all variable names", () => {
      const template = `{{name}} {{email}} {{phone}}` as const;
      type Vars = TemplateVariables<typeof template>;

      // Type assertion - would fail if "name" | "email" | "phone" isn't the type
      const nameVar: Vars = "name";
      const emailVar: Vars = "email";
      const phoneVar: Vars = "phone";

      expect(nameVar).toBe("name");
      expect(emailVar).toBe("email");
      expect(phoneVar).toBe("phone");
    });
  });

  describe("TemplateArrays", () => {
    it("should extract array names from {{#each}} blocks", () => {
      const template = `{{#each products}}{{name}}{{/each}} {{#each tags}}{{label}}{{/each}}` as const;
      type Arrays = TemplateArrays<typeof template>;

      const arr1: Arrays = "products";
      const arr2: Arrays = "tags";

      expect(arr1).toBe("products");
      expect(arr2).toBe("tags");
    });
  });

  describe("createTypedTemplate", () => {
    it("should create a typed template object", () => {
      const result = createTypedTemplate(`Hello {{name}}!`);

      expect(result.template).toBe("Hello {{name}}!");
      expect(result).toHaveProperty("_dataType");
    });

    it("should preserve template string", () => {
      const template = `{{#each items}}{{title}}{{/each}}`;
      const result = createTypedTemplate(template);

      expect(result.template).toBe(template);
    });
  });

  describe("Real-world usage patterns", () => {
    it("should handle a typical prompt template", () => {
      const template = `
        You are a helpful assistant for {{companyName}}.

        User: {{userName}}
        Query: {{userQuery}}

        {{#each products}}
        - {{name}}: {{description}}
        {{/each}}
      ` as const;

      type Data = InferTemplateData<typeof template>;

      const data: Data = {
        companyName: "Acme Corp",
        userName: "John",
        userQuery: "Help me find a product",
        products: [
          { name: "Widget", description: "A great widget" },
        ],
      };

      expect(data.companyName).toBe("Acme Corp");
      expect(data.products[0].name).toBe("Widget");
    });

    it("should work with PromptWeaver", async () => {
      // Import dynamically to avoid circular deps in test
      const { PromptWeaver } = await import("../../src/index.js");

      const template = `Hello {{name}}! You have {{count}} messages.` as const;
      type Data = InferTemplateData<typeof template>;

      // Create weaver and use inferred type for data
      const weaver = new PromptWeaver(template);
      const data: Data = { name: "Alice", count: 5 };
      const result = weaver.format(data);

      expect(result).toBe("Hello Alice! You have 5 messages.");
    });
  });

  describe("new PromptWeaver(template) - automatic type inference", () => {
    it("should create a weaver with automatic type inference", () => {
      const template = `Hello {{name}}! You have {{count}} items.` as const;
      const weaver = new PromptWeaver(template);

      // format() requires the inferred type: { name: unknown; count: unknown }
      const result = weaver.format({ name: "Alice", count: 5 });
      expect(result).toBe("Hello Alice! You have 5 items.");
    });

    it("should infer array types from {{#each}}", () => {
      const template = `{{#each items}}{{title}} {{/each}}` as const;
      const weaver = new PromptWeaver(template);

      // format() requires: { items: Array<{ title: unknown }> }
      const result = weaver.format({
        items: [{ title: "A" }, { title: "B" }],
      });
      expect(result).toBe("A B ");
    });

    it("should support formatAsync", async () => {
      const template = `Hello {{name}}!` as const;
      const weaver = new PromptWeaver(template);

      const result = await weaver.formatAsync({ name: "Bob" });
      expect(result).toBe("Hello Bob!");
    });

    it("should support extractVariables", () => {
      const template = `{{name}} {{email}} {{phone}}` as const;
      const weaver = new PromptWeaver(template);

      const vars = weaver.extractVariables();
      expect(vars.has("name")).toBe(true);
      expect(vars.has("email")).toBe(true);
      expect(vars.has("phone")).toBe(true);
    });

    it("should work with complex templates", () => {
      const template = `
        User: {{userName}}
        {{#each orders}}
        - Order #{{orderId}}: {{total}}
        {{/each}}
      ` as const;

      const weaver = new PromptWeaver(template);

      // format() requires: { userName: unknown; orders: Array<{ orderId: unknown; total: unknown }> }
      const result = weaver.format({
        userName: "Alice",
        orders: [
          { orderId: "001", total: 99.99 },
          { orderId: "002", total: 149.99 },
        ],
      });

      expect(result).toContain("User: Alice");
      expect(result).toContain("Order #001");
      expect(result).toContain("Order #002");
    });
  });
});

