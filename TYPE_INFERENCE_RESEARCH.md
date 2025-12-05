# Template Type Inference - Implementation Summary

## What We Built

**Compile-time type inference from Handlebars templates** using TypeScript's template literal types.

This allows TypeScript to automatically infer the expected data structure from a template string, without any code generation or runtime overhead.

## Usage

### Automatic Type Inference (No New API!)

Just use `as const` on your template and `new PromptWeaver(template)` works with automatic inference:

```typescript
import { PromptWeaver } from "@iqai/prompt-weaver";

// Define template with `as const` for type inference
const template = `Hello {{name}}! You have {{count}} items.` as const;

// PromptWeaver automatically infers the data type!
const weaver = new PromptWeaver(template);

// format() now requires: { name: unknown; count: unknown }
weaver.format({ name: "Alice", count: 5 }); // ✅ Works
weaver.format({ name: "Bob" }); // ❌ TypeScript Error: missing 'count'
```

### Manual Type Extraction (if needed)

```typescript
import { InferTemplateData, PromptWeaver } from "@iqai/prompt-weaver";

const template = `Hello {{name}}!` as const;

// Extract the type for use elsewhere
type Data = InferTemplateData<typeof template>;
// Data = { name: unknown }

function getData(): Data {
  return { name: "World" };
}
```

### Array Inference from `{{#each}}`

```typescript
const template = `
  {{#each products}}
    - {{name}}: {{description}} ({{price}})
  {{/each}}
` as const;

type Data = InferTemplateData<typeof template>;
// Data = { products: Array<{ name: unknown; description: unknown; price: unknown }> }

const data: Data = {
  products: [
    { name: "Widget", description: "A great widget", price: 29.99 },
    { name: "Gadget", description: "A cool gadget", price: 49.99 },
  ],
};
```

### Mixed Variables and Arrays

```typescript
const template = `
  Welcome {{userName}}!
  
  Your orders:
  {{#each orders}}
    Order #{{orderId}}: {{total}}
  {{/each}}
` as const;

type Data = InferTemplateData<typeof template>;
// Data = {
//   userName: unknown;
//   orders: Array<{ orderId: unknown; total: unknown }>;
// }
```

### Helper Types

```typescript
import { 
  InferTemplateData,
  TemplateVariables,
  TemplateArrays,
  createTypedTemplate 
} from "@iqai/prompt-weaver";

const template = `{{name}} {{#each items}}{{title}}{{/each}}` as const;

// Get just the variable names
type Vars = TemplateVariables<typeof template>;
// Vars = "name" | "items"

// Get just the array names
type Arrays = TemplateArrays<typeof template>;
// Arrays = "items"

// Create a typed template object
const typed = createTypedTemplate(template);
// typed.template = the string
// typed._dataType = the inferred type (for reference)
```

## How It Works

The implementation uses TypeScript's **template literal types** (TypeScript 4.1+) to parse the template string at compile time:

1. **Extract Mustaches**: Find all `{{variable}}` patterns in the template
2. **Parse Variables**: Extract variable names, handling helpers like `{{uppercase name}}`
3. **Detect Arrays**: Find `{{#each arrayName}}` blocks and extract array item properties
4. **Build Type**: Construct an object type from the extracted information

### Type System Components

```typescript
// Extract content from {{...}}
type ExtractMustache<S> = S extends `${string}{{${infer Content}}}${infer Rest}`
  ? Content | ExtractMustache<Rest>
  : never;

// Detect {{#each array}} blocks
type ExtractEachArray<S> = S extends `...{{#each ${infer Arr}}}...{{/each}}...`
  ? Arr
  : never;

// Build object type from variable names
type VarsToObject<V extends string> = { [K in V]: unknown };
```

## Limitations

⚠️ **Important**: Template type inference is **best-effort** and has significant limitations:

1. **Custom Transformers**: Transformers registered at runtime (via `registerTransformer()` or custom registries) are **NOT visible** to the TypeScript type system. The type inference cannot understand what custom transformers do.
   ```typescript
   // ❌ Type inference cannot see this transformer
   registerTransformer("filter", (arr, condition) => { /* ... */ });
   const template = `{{#each (filter items 'active')}}{{name}}{{/each}}` as const;
   // Inference fails - can't understand what 'filter' does
   ```

2. **Partials**: When templates use partials (`{{> partialName}}`), inference can only see variables in the main template, not inside partials. However, the type is **loose** - it requires main template variables but allows any additional properties for partials.

3. **Complex Helper Expressions**: Subexpressions like `{{#each (helper arg)}}` may not be fully understood since the type system can't analyze transformer behavior.

4. **TypeScript Recursion Limits**: Extremely complex templates may hit TypeScript's type recursion limits

5. **Unknown Types**: All inferred types are `unknown` - we can't determine if `{{price}}` is string or number

6. **Literal Types Required**: You must use `as const` to get literal string types

7. **No Runtime Validation**: This is compile-time only - use schemas for runtime validation

## When to Use What

### ✅ Use Schemas (RECOMMENDED for Production)

**Always use schemas when:**
- You have custom transformers
- You use partials
- You need runtime validation
- You need specific types (not just `unknown`)
- You want reliable type safety

```typescript
import { z } from "zod";
import { PromptWeaver } from "@iqai/prompt-weaver";

// Define schema with actual types
const schema = z.object({
  name: z.string(),
  age: z.number().positive(),
});

// PromptWeaver validates at runtime + provides type safety
const weaver = new PromptWeaver(template, { schema });
const result = weaver.format({ name: "Alice", age: 30 }); // ✅ Type-safe + validated
```

### ⚠️ Template Inference (Best-Effort, Simple Cases Only)

**Only use template inference when:**
- You have simple templates without custom transformers
- You don't use partials
- You're okay with `unknown` types
- You're prototyping or in development

```typescript
// Simple template - inference works
const template = `Hello {{name}}! Age: {{age}}` as const;
const weaver = new PromptWeaver(template);
// format() infers: { name: unknown; age: unknown }
```

**Don't use template inference when:**
- ❌ You have custom transformers
- ❌ You use partials
- ❌ You need reliable type safety
- ❌ You're in production code

## Best Practice: Use Schemas

For production code, **always use schemas**. They provide:
- ✅ Full type safety with specific types
- ✅ Runtime validation
- ✅ Works with custom transformers
- ✅ Works with partials
- ✅ Reliable and predictable

```typescript
import { z } from "zod";
import { PromptWeaver } from "@iqai/prompt-weaver";

const schema = z.object({
  name: z.string(),
  age: z.number().positive(),
});

// Option 1: Pass schema in options
const weaver = new PromptWeaver(template, { schema });

// Option 2: Use explicit factory method (clearer intent)
const weaver2 = PromptWeaver.createWithSchema(template, { schema });

const result = weaver.format({ name: "Alice", age: 30 }); // ✅ Type-safe + validated
```

## Exported Types and Functions

| Export | Type | Description |
|--------|------|-------------|
| `PromptWeaver` | Class | **Main class** - loose type inference from template |
| `InferTemplateData<T>` | Type | Infer data structure from template (loose) |
| `TemplateVariables<T>` | Type | Extract variable names as union |
| `TemplateArrays<T>` | Type | Extract array names from `{{#each}}` |
| `TemplateConditions<T>` | Type | Extract condition variables from `{{#if}}` |
| `TemplateDataType<T>` | Type | Alias for `InferTemplateData` |
| `createTypedTemplate()` | Function | Create typed template object (for inspection) |

## Quick Reference

| Scenario | Solution |
|----------|----------|
| Any template | `new PromptWeaver(template)` - loose inference allows extras |
| With partials | `new PromptWeaver(template, { partials })` - just works! |
| Need runtime validation | `new PromptWeaver(template, { schema })` |
| Custom transformers | `new PromptWeaver(template)` - loose inference allows extras |
