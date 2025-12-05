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

1. **TypeScript Recursion Limits**: Extremely complex templates may hit TypeScript's type recursion limits
2. **Unknown Types**: All inferred types are `unknown` - we can't determine if `{{price}}` is string or number
3. **Literal Types Required**: You must use `as const` to get literal string types
4. **No Runtime Validation**: This is compile-time only - use schemas for runtime validation

## Best Practice: Combine with Schemas

For full type safety (compile-time + runtime), combine type inference with schemas:

```typescript
import { z } from "zod";
import { InferTemplateData, PromptWeaver } from "@iqai/prompt-weaver";

const template = `Hello {{name}}! Age: {{age}}` as const;

// Use inference to guide your schema definition
type Inferred = InferTemplateData<typeof template>;
// Inferred = { name: unknown; age: unknown }

// Define schema with actual types
const schema = z.object({
  name: z.string(),
  age: z.number().positive(),
});

// PromptWeaver validates at runtime
const weaver = new PromptWeaver(template, { schema });
const result = weaver.format({ name: "Alice", age: 30 }); // ✅ Type-safe + validated
```

## Exported Types and Functions

| Export | Type | Description |
|--------|------|-------------|
| `PromptWeaver` | Class | **Main class** - now with automatic type inference from template |
| `InferTemplateData<T>` | Type | Infer data structure from template |
| `TemplateVariables<T>` | Type | Extract variable names as union |
| `TemplateArrays<T>` | Type | Extract array names from `{{#each}}` |
| `TemplateConditions<T>` | Type | Extract condition variables from `{{#if}}` |
| `TemplateDataType<T>` | Type | Alias for `InferTemplateData` |
| `createTypedTemplate()` | Function | Create typed template object (for inspection) |
