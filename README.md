# @iqai/prompt-weaver

A powerful, extensible template engine for building prompts with Handlebars. Prompt Weaver provides a comprehensive set of transformers, validation utilities, and a fluent API for programmatic prompt construction.

## Features

- 🎯 **Extensible Plugin System** - Register custom transformers and helpers
- 🔧 **Rich Built-in Transformers** - String, date, object, collection, and conditional helpers
- ✅ **Validation & Type Safety** - Validate templates and data with detailed error messages
- 🏗️ **Fluent Builder API** - Programmatically build prompts with a clean API
- 📝 **Template Composition** - Compose multiple templates together
- 🎨 **TypeScript Support** - Full type safety with generics

## Installation

```bash
npm install @iqai/prompt-weaver
# or
pnpm add @iqai/prompt-weaver
# or
yarn add @iqai/prompt-weaver
```

## Quick Start

### Basic Usage

```typescript
import { PromptWeaver } from "@iqai/prompt-weaver";

const template = "Hello, {{name}}! Your balance is {{balance currency}}.";

const weaver = new PromptWeaver(template);
const output = weaver.format({
  name: "Alice",
  balance: 1234.56,
});

console.log(output);
// "Hello, Alice! Your balance is $1,234.56."
```

### With TypeScript Types

```typescript
interface UserData {
  name: string;
  balance: number;
}

const weaver = new PromptWeaver<UserData>(template);
const output = weaver.format({
  name: "Alice",
  balance: 1234.56,
});
```

## Core API

### PromptWeaver Class

The main class for rendering Handlebars templates.

#### Constructor

```typescript
new PromptWeaver(templateSource, options?)
```

**Parameters:**
- `templateSource`: Template string or imported template module
- `options`: Optional configuration object

**Options:**
```typescript
interface PromptWeaverOptions {
  transformers?: Array<{
    name: string;
    handler: HandlebarsHelper;
    metadata?: { description?: string; dependencies?: string[]; version?: string };
  }>;
  strict?: boolean; // Warn about extra variables
  throwOnMissing?: boolean; // Throw error on missing required variables
  helpers?: Record<string, HandlebarsHelper>; // Additional helpers
  registry?: TransformerRegistry; // Custom transformer registry
  partials?: Record<string, string>; // Partial templates
}
```

#### Methods

**`format(data)`** - Render the template with data
```typescript
const output = weaver.format({ name: "Alice", value: 100 });
```

**`validate(data)`** - Validate data against template requirements
```typescript
const result = weaver.validate({ name: "Alice" });
if (!result.valid) {
  console.log("Missing:", result.missing);
  console.log("Errors:", result.errors);
}
```

**`extractVariables()`** - Get required variables from template
```typescript
const variables = weaver.extractVariables();
console.log(Array.from(variables)); // ["name", "balance"]
```

**`setPartial(name, templateSource)`** - Register a partial template
```typescript
weaver.setPartial("header", "<header>{{title}}</header>");
```

**`getMetadata()`** - Get template metadata
```typescript
const metadata = weaver.getMetadata();
console.log(metadata.variables); // ["name", "balance"]
console.log(metadata.helpers); // ["currency", "if"]
console.log(metadata.partials); // ["header"]
```

**`compose(templateSources, separator?)`** - Compose multiple templates (static)
```typescript
const composed = PromptWeaver.compose([template1, template2], "\n\n");
const weaver = new PromptWeaver(composed);
```

## Built-in Transformers

### Formatters

Format values for display:

```handlebars
{{price currency}}        <!-- $1,234.56 -->
{{price price}}           <!-- $0.1234 -->
{{percentage percent}}     <!-- 12.34% -->
{{change signedPercent}}  <!-- +12.34% -->
{{amount signedCurrency}} <!-- +$1,234.56 -->
{{count integer}}         <!-- 1,234 -->
{{value number}}          <!-- 1,234.56 -->
{{large compact}}        <!-- 1.2K, 3.4M, 5.6B -->
{{text upper}}            <!-- UPPERCASE -->
{{text lower}}            <!-- lowercase -->
{{text capitalize}}      <!-- Capitalized -->
{{text truncate}}        <!-- Truncated... -->
{{data json}}            <!-- JSON string -->
```

### String Transformers

```handlebars
{{text replace "old" "new"}}           <!-- Replace text -->
{{text replaceAll " " "-"}}           <!-- Replace all occurrences -->
{{text regexReplace "\\d+" "NUM"}}    <!-- Regex replace -->
{{text slice 0 10}}                    <!-- Slice string -->
{{text substring 5 10}}                <!-- Substring -->
{{text padStart 10 "0"}}              <!-- Pad start -->
{{text padEnd 10 " "}}                <!-- Pad end -->
{{text split ","}}                    <!-- Split into array -->
{{array join ", "}}                   <!-- Join array -->
{{text trim}}                          <!-- Trim whitespace -->
{{text slugify}}                       <!-- Convert to slug -->
{{text kebabCase}}                    <!-- kebab-case -->
{{text camelCase}}                     <!-- camelCase -->
{{text snakeCase}}                    <!-- snake_case -->
{{word pluralize}}                    <!-- Pluralize -->
{{words singularize}}                 <!-- Singularize -->
{{text ellipsis 50}}                  <!-- Truncate with ellipsis -->
```

### Date/Time Transformers

```handlebars
{{date formatDate "YYYY-MM-DD"}}      <!-- Format date -->
{{date formatTime}}                   <!-- Format time -->
{{date formatDateTime}}               <!-- Format date and time -->
{{date relativeTime}}                 <!-- "2 hours ago" -->
{{date isToday}}                      <!-- Boolean -->
{{date isPast}}                       <!-- Boolean -->
{{date isFuture}}                     <!-- Boolean -->
{{date addDays 7}}                    <!-- Add days -->
{{date subtractDays 3}}               <!-- Subtract days -->
{{date addHours 2}}                   <!-- Add hours -->
{{date timestamp}}                    <!-- Milliseconds timestamp -->
{{date unixTimestamp}}                <!-- Unix timestamp -->
```

### Object Transformers

```handlebars
{{get obj "key"}}                     <!-- Get property -->
{{has obj "key"}}                     <!-- Check property -->
{{keys obj}}                          <!-- Get keys array -->
{{values obj}}                        <!-- Get values array -->
{{pick obj "key1" "key2"}}           <!-- Pick properties -->
{{omit obj "key1" "key2"}}           <!-- Omit properties -->
{{merge obj1 obj2}}                  <!-- Merge objects -->
{{defaults obj defaults}}            <!-- Apply defaults -->
{{deepGet obj "nested.property"}}    <!-- Nested access -->
{{isEmpty value}}                    <!-- Check if empty -->
{{isNotEmpty value}}                 <!-- Check if not empty -->
```

### Collection Transformers

```handlebars
{{filter array "property"}}           <!-- Filter array -->
{{map array "property"}}              <!-- Map array -->
{{find array "property" value}}       <!-- Find item -->
{{findIndex array "property" value}} <!-- Find index -->
{{includes array value}}              <!-- Check inclusion -->
{{sort array "property"}}             <!-- Sort array -->
{{reverse array}}                     <!-- Reverse array -->
{{first array}}                       <!-- First item -->
{{last array}}                        <!-- Last item -->
{{nth array 2}}                       <!-- Nth item -->
{{unique array}}                      <!-- Unique values -->
{{groupBy array "property"}}         <!-- Group by property -->
{{partition array "property"}}       <!-- Partition array -->
{{chunk array 3}}                    <!-- Chunk array -->
{{flatten array}}                     <!-- Flatten array -->
{{arraySlice array 0 5}}              <!-- Slice array -->
```

### Conditional Transformers

```handlebars
{{#if condition}}
  Content
{{/if}}

{{#unless condition}}
  Content
{{/unless}}

{{ifElse condition "yes" "no"}}      <!-- Ternary -->
{{coalesce value1 value2 value3}}   <!-- First non-null -->
{{default value "default"}}          <!-- Default value -->
{{exists value}}                      <!-- Check existence -->
{{isDefined value}}                  <!-- Check defined -->
```

### Arithmetic Transformers

```handlebars
{{increment value}}                   <!-- Add 1 -->
{{add a b}}                          <!-- Addition -->
{{subtract a b}}                     <!-- Subtraction -->
{{multiply a b}}                     <!-- Multiplication -->
{{divide a b}}                       <!-- Division -->
```

### Comparison Transformers

```handlebars
{{eq a b}}                           <!-- Equal -->
{{ne a b}}                           <!-- Not equal -->
{{gt a b}}                           <!-- Greater than -->
{{gte a b}}                          <!-- Greater than or equal -->
{{lt a b}}                           <!-- Less than -->
{{lte a b}}                           <!-- Less than or equal -->
```

### Logical Transformers

```handlebars
{{#and condition1 condition2}}
  Content
{{/and}}

{{#or condition1 condition2}}
  Content
{{/or}}
```

## Prompt Builder API

Build prompts programmatically with a fluent API:

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const prompt = new PromptBuilder()
  .heading(1, "User Profile")
  .section("Personal Information", () => {
    return "Name: {{name}}\nEmail: {{email}}";
  })
  .list(["Item 1", "Item 2", "Item 3"])
  .table(
    ["Name", "Age", "City"],
    [
      ["Alice", "30", "New York"],
      ["Bob", "25", "London"],
    ]
  )
  .conditional(user.isPremium, "Premium features enabled", "Upgrade to premium")
  .code("function example() { return 'hello'; }", "javascript")
  .build();

const weaver = prompt.toPromptWeaver();
```

### Builder Methods

- `.section(title?, content?)` - Add a section
- `.code(code, language?)` - Add code block
- `.list(items, ordered?)` - Add list
- `.table(headers, rows)` - Add table
- `.conditional(condition, ifTrue, ifFalse?)` - Add conditional content
- `.loop(items, callback)` - Add loop content
- `.text(text)` - Add raw text
- `.separator(char?)` - Add separator
- `.heading(level, text)` - Add heading
- `.quote(text)` - Add blockquote
- `.build()` - Build final prompt string
- `.toPromptWeaver(options?)` - Create PromptWeaver instance
- `.validate(data, options?)` - Validate data
- `.clear()` - Clear all content

## Custom Transformers

Register custom transformers:

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

registerTransformer("uppercase", (value) => {
  return String(value).toUpperCase();
});

// Use in template
// {{name uppercase}}
```

Or use the registry:

```typescript
import { TransformerRegistry } from "@iqai/prompt-weaver";

const registry = TransformerRegistry.createScoped();
registry.registerTransformer("customHelper", (value) => {
  return `Custom: ${value}`;
});

const weaver = new PromptWeaver(template, {
  registry: registry,
});
```

## Validation

### Template Validation

```typescript
import { validateTemplate } from "@iqai/prompt-weaver";

const result = validateTemplate(templateSource);
if (!result.valid) {
  console.error("Template errors:", result.errors);
}
```

### Data Validation

```typescript
const weaver = new PromptWeaver(template, {
  throwOnMissing: true, // Throw error on missing variables
  strict: true, // Warn about extra variables
});

const result = weaver.validate(data);
if (!result.valid) {
  console.log("Missing variables:", result.missing);
  console.log("Extra variables:", result.extra);
  console.log("Errors:", result.errors);
}
```

## Template Composition

Compose multiple templates:

```typescript
const header = "# Header\n";
const body = "Body content: {{content}}";
const footer = "---\nFooter";

const composed = PromptWeaver.compose([header, body, footer]);
const weaver = new PromptWeaver(composed);
```

Or create directly:

```typescript
const weaver = PromptWeaver.composeAndCreate(
  [header, body, footer],
  { strict: true }
);
```

## Partials

Register and use partial templates:

```typescript
const weaver = new PromptWeaver(mainTemplate, {
  partials: {
    header: "<header>{{title}}</header>",
    footer: "<footer>Footer</footer>",
  },
});

// In template:
// {{> header}}
// Main content
// {{> footer}}
```

Or register programmatically:

```typescript
weaver.setPartial("header", "<header>{{title}}</header>");
```

## Error Handling

Enhanced error messages with context:

```typescript
import { ValidationError, TemplateCompilationError } from "@iqai/prompt-weaver";

try {
  const weaver = new PromptWeaver(template);
  const output = weaver.format(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(error.getFormattedMessage());
    // "Missing required variable: name (field: name, line: 5)"
  } else if (error instanceof TemplateCompilationError) {
    console.error(error.getFormattedMessage());
    // "Template syntax error (line: 10, column: 5)"
  }
}
```

## Examples

### Trading Prompt Example

```typescript
const template = `
# Trading Analysis

## Market Overview
Current price: {{price price}}
24h change: {{change signedPercent}}

## Portfolio
{{#each positions}}
- {{symbol}}: {{quantity}} @ {{avgPrice price}}
  P&L: {{pnl signedCurrency}}
{{/each}}

## Summary
Total value: {{totalValue currency}}
Total P&L: {{totalPnL signedCurrency}}
`;

const weaver = new PromptWeaver(template);
const output = weaver.format({
  price: 0.1234,
  change: 5.67,
  positions: [
    { symbol: "BTC", quantity: 1.5, avgPrice: 0.12, pnl: 500 },
    { symbol: "ETH", quantity: 10, avgPrice: 0.05, pnl: -200 },
  ],
  totalValue: 50000,
  totalPnL: 300,
});
```

### Programmatic Prompt Building

```typescript
const builder = new PromptBuilder();

builder
  .heading(1, "AI Assistant Prompt")
  .section("Context", "You are a helpful assistant.")
  .section("Instructions", () => {
    return `1. Be polite\n2. Be concise\n3. Use examples`;
  })
  .conditional(includeExamples, () => {
    return builder.code(exampleCode, "typescript");
  })
  .build();
```

## TypeScript Support

Full TypeScript support with generics:

```typescript
interface PromptData {
  name: string;
  age: number;
  email: string;
}

const weaver = new PromptWeaver<PromptData>(template);
// TypeScript will enforce the data shape
const output = weaver.format({
  name: "Alice",
  age: 30,
  email: "alice@example.com",
});
```

## License

MIT
