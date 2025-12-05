<div align="center">

# Prompt Weaver - Craft Powerful Prompts with Ease

A powerful, extensible template engine for building prompts. Prompt Weaver provides a comprehensive set of transformers, validation utilities, and a fluent API for programmatic prompt construction.

</div>

## ✨ Features

- 🎯 **Extensible Plugin System** - Register custom transformers and helpers
- 🔧 **Rich Built-in Transformers** - String, date, object, collection, and conditional helpers
- ✅ **Validation & Type Safety** - Validate templates and data with detailed error messages
- 🏗️ **Fluent Builder API** - Programmatically build prompts with a clean API
- 📝 **Template Composition** - Compose multiple templates together
- 🎨 **TypeScript Support** - Full type safety with generics

## 📦 Installation

```bash
npm install @iqai/prompt-weaver
# or
pnpm add @iqai/prompt-weaver
# or
yarn add @iqai/prompt-weaver
```

## 🚀 Quick Start

### A Quick Taste: Complex Prompt Example

Here's a short but powerful example showcasing Prompt Weaver's capabilities:

```typescript
import { PromptWeaver } from "@iqai/prompt-weaver";

const template = `
You are an AI assistant helping {{userName}} with their {{taskType}}.

## Account Summary
- **Balance**: {{balance currency}}
- **Member Since**: {{memberSince formatDate "MMMM YYYY"}}
- **Status**: {{#if isPremium}}⭐ Premium{{else}}Standard{{/if}}

## Task Details
{{#if hasDeadline}}
⚠️ **Deadline**: {{deadline relativeTime}} ({{deadline formatDate "MMM DD, YYYY"}})
{{/if}}

## Requirements
{{#each requirements}}
{{increment @index}}. {{this}}
{{/each}}

{{#if notes}}
## Additional Notes
{{notes ellipsis 100}}
{{/if}}
`;

const weaver = new PromptWeaver(template);
const output = weaver.format({
  userName: "Alice",
  taskType: "project planning",
  balance: 1234.56,
  memberSince: new Date("2023-06-15"),
  isPremium: true,
  hasDeadline: true,
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  requirements: [
    "Create detailed project timeline",
    "Identify potential risks",
    "Estimate resource requirements"
  ],
  notes: "This is a high-priority project that requires careful attention to detail and stakeholder communication. We need to ensure all deliverables are met on time while maintaining quality standards. Regular check-ins with the team will be essential to track progress and address any blockers early."
});

console.log(output);
```

**Output:**
```ellipsis
You are an AI assistant helping Alice with their project planning.

## Account Summary
- **Balance**: $1,234.56
- **Member Since**: June 2023
- **Status**: ⭐ Premium

## Task Details
⚠️ **Deadline**: in 7 days (Dec 15, 2024)

## Requirements
1. Create detailed project timeline
2. Identify potential risks
3. Estimate resource requirements

## Additional Notes
This is a high-priority project that requires careful attention to detail and stakeholder communication. We need to ensure all deliv...
```

This example demonstrates:
- ✨ Variable interpolation with transformers (`currency`, `formatDate`, `relativeTime`, `ellipsis`)
- 🔀 Conditional blocks (`{{#if}}`)
- 🔁 Loops with indexing (`{{#each}}` with `{{increment @index}}`)
- 📅 Date formatting and relative time
- 💰 Number formatting

### 🔄 Understanding Builder vs Weaver

**PromptWeaver** is a template engine that renders Handlebars templates with data:
- Use when you have template strings with variables (`{{variable}}`)
- Best for declarative, template-based rendering
- Supports all transformers, helpers, and advanced features

**PromptBuilder** is a fluent API for programmatically constructing prompts:
- Use when building prompts dynamically in code
- Best for imperative, code-based construction
- Can convert to PromptWeaver for template rendering

**They work together!** Build programmatically with Builder, then convert to Weaver for rendering:

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const builder = new PromptBuilder()
  .section("Introduction", "Hello {{name}}!")
  .section("Details", "Balance: {{balance currency}}");

// Convert to PromptWeaver and render with data
const weaver = builder.toPromptWeaver();
const output = weaver.format({
  name: "Alice",
  balance: 1234.56,
});
```

### 📝 Basic Usage with PromptWeaver

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

### 🏗️ Basic Usage with PromptBuilder

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const builder = new PromptBuilder()
  .heading(1, "User Profile")
  .section("Personal Information", "Name: {{name}}\nEmail: {{email}}")
  .list(["Feature 1", "Feature 2", "Feature 3"]);

// Option 1: Get the template string
const template = builder.build();

// Option 2: Convert directly to PromptWeaver and render
const weaver = builder.toPromptWeaver();
const output = weaver.format({
  name: "Alice",
  email: "alice@example.com",
});
```

### 🔷 With TypeScript Types

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

## 🔧 Core API

### PromptWeaver Class

The main class for rendering Prompt Weaver templates.

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
    handler: TemplateHelper;
    metadata?: { description?: string; dependencies?: string[]; version?: string };
  }>;
  helpers?: Record<string, TemplateHelper>; // Additional helpers
  registry?: TransformerRegistry; // Custom transformer registry
  partials?: Record<string, string>; // Partial templates
  schema?: StandardSchemaV1; // Standard Schema validator (Zod, Valibot, ArkType, etc.)
}
```

#### Methods

**`format(data)`** - Render the template with data
```typescript
const output = weaver.format({ name: "Alice", value: 100 });
```

**`validateSchema(data)`** - Validate data against schema (requires schema option)
```typescript
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number().positive(),
});

const weaver = new PromptWeaver(template, { schema });
const result = weaver.validateSchema({ name: "Alice", age: 30 });
if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.error("Validation errors:", result.issues);
}
```

**`formatWithSchema(data)`** - Format with automatic validation
```typescript
// Validates and renders in one step
// Throws SchemaValidationError if validation fails
const output = weaver.formatWithSchema({ name: "Alice", age: 30 });
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

## 🤝 Using Builder and Weaver Together

The Builder and Weaver are designed to work seamlessly together. Here's a complete workflow:

### Workflow: Build → Convert → Render

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

// Step 1: Build the template structure programmatically
const builder = new PromptBuilder()
  .heading(1, "User Dashboard")
  .section("Welcome", "Hello {{userName}}!")
  .section("Account Info", "Your balance is {{balance currency}}")
  .conditional(isPremium, "⭐ Premium Member", "Upgrade to Premium");

// Step 2: Convert to PromptWeaver for template rendering
const weaver = builder.toPromptWeaver();

// Step 3: Render with data (can be called multiple times)
const output1 = weaver.format({ userName: "Alice", balance: 1000, isPremium: true });
const output2 = weaver.format({ userName: "Bob", balance: 500, isPremium: false });

// Step 4: Validate data before rendering (with schema)
import { z } from 'zod';

const schema = z.object({
  userName: z.string(),
  balance: z.number(),
  isPremium: z.boolean(),
});

const weaverWithSchema = builder.toPromptWeaver({ schema });
const validation = weaverWithSchema.validateSchema({ userName: "Alice", balance: 1000, isPremium: true });
if (!validation.success) {
  console.error("Validation errors:", validation.issues);
}
```

### Key Integration Points

1. **`builder.toPromptWeaver(options?)`** - Converts the built prompt to a PromptWeaver instance
2. **`builder.build()`** - Returns the template string, which can be used with `new PromptWeaver()`
3. **Schema validation** - Use `builder.toPromptWeaver({ schema })` and then call `weaver.validateSchema(data)`

### When to Use Each Approach

| Scenario | Use Builder | Use Weaver | Use Both |
|----------|-------------|------------|----------|
| Static template strings | ❌ | ✅ | ❌ |
| Dynamic prompt construction | ✅ | ❌ | ✅ |
| Conditional sections | ✅ | ✅* | ✅ |
| Template rendering with data | ❌ | ✅ | ✅ |
| Reusable templates | ❌ | ✅ | ✅ |
| Complex programmatic logic | ✅ | ❌ | ✅ |

*Weaver supports conditionals via Handlebars `{{#if}}` blocks, but Builder's conditional() is better for code-based logic

## 🎨 Built-in Transformers

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

### 📝 String Transformers

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

### 📅 Date/Time Transformers

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

### 📦 Object Transformers

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

### 📊 Collection Transformers

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

### 🔀 Conditional Transformers

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

### ➕ Arithmetic Transformers

```handlebars
{{increment value}}                   <!-- Add 1 -->
{{add a b}}                          <!-- Addition -->
{{subtract a b}}                     <!-- Subtraction -->
{{multiply a b}}                     <!-- Multiplication -->
{{divide a b}}                       <!-- Division -->
```

### ⚖️ Comparison Transformers

```handlebars
{{eq a b}}                           <!-- Equal -->
{{ne a b}}                           <!-- Not equal -->
{{gt a b}}                           <!-- Greater than -->
{{gte a b}}                          <!-- Greater than or equal -->
{{lt a b}}                           <!-- Less than -->
{{lte a b}}                           <!-- Less than or equal -->
```

### 🔗 Logical Transformers

```handlebars
{{#and condition1 condition2}}
  Content
{{/and}}

{{#or condition1 condition2}}
  Content
{{/or}}
```

## 🏗️ Prompt Builder API

Build prompts programmatically with a fluent API. The Builder is perfect for dynamically constructing prompts in code, then you can convert it to a PromptWeaver instance for rendering with data.

### Basic Example

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const builder = new PromptBuilder()
  .heading(1, "User Profile")
  .section("Personal Information", "Name: {{name}}\nEmail: {{email}}")
  .list(["Item 1", "Item 2", "Item 3"])
  .table(
    ["Name", "Age", "City"],
    [
      ["Alice", "30", "New York"],
      ["Bob", "25", "London"],
    ]
  )
  .conditional(user.isPremium, "Premium features enabled", "Upgrade to premium")
  .code("function example() { return 'hello'; }", "javascript");

// Convert to PromptWeaver and render with data
const weaver = builder.toPromptWeaver();
const output = weaver.format({
  name: "Alice",
  email: "alice@example.com",
});

// Or just get the template string
const templateString = builder.build();
```

### When to Use Builder vs Weaver

**Use PromptBuilder when:**
- Building prompts dynamically based on runtime conditions
- Constructing prompts programmatically with complex logic
- You want a fluent, chainable API for prompt construction
- The prompt structure changes based on user input or application state

**Use PromptWeaver when:**
- You have static template strings with variables
- You need to render templates multiple times with different data
- You want to leverage advanced Handlebars features (helpers, partials, conditionals)
- You need template validation and metadata extraction

**Use Both Together:**
- Build the template structure with Builder
- Convert to Weaver for rendering and validation
- Best of both worlds: programmatic construction + template rendering

### Builder Methods

All methods return `this` for method chaining.

**Content Methods:**
- `.section(title?, content?)` - Add a section (content can be string or function)
- `.text(text)` - Add raw text content
- `.code(code, language?)` - Add code block with optional language
- `.list(items, ordered?)` - Add list (ordered or unordered)
- `.table(headers, rows)` - Add markdown table
- `.heading(level, text)` - Add heading (level 1-6)
- `.quote(text)` - Add blockquote
- `.separator(char?)` - Add separator line (default: "---")

**Control Flow Methods:**
- `.conditional(condition, ifTrue, ifFalse?)` - Add conditional content based on boolean
- `.loop(items, callback)` - Add content by iterating over items

**Utility Methods:**
- `.build()` - Build final prompt string
- `.toPromptWeaver(options?)` - Convert to PromptWeaver instance for rendering
- `.clear()` - Clear all content and start fresh

**Validation:** Use `.toPromptWeaver({ schema })` and then call `weaver.validateSchema(data)` on the returned instance.

## 🎯 Custom Transformers

Register custom transformers with or without options:

### Simple Transformer (No Options)

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

registerTransformer("uppercase", (value) => {
  return String(value).toUpperCase();
});

// Use in template
// {{name uppercase}}
```

### Transformer with Options

Transformers can accept options as additional parameters. The first parameter is always the value being transformed, followed by any options:

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

// Transformer with one option (like ellipsis)
registerTransformer("truncate", (value, maxLength) => {
  const str = String(value);
  const length = Number(maxLength) || 50;
  return str.length > length ? `${str.slice(0, length - 3)}...` : str;
});

// Use in template
// {{longText truncate 100}}
```

### Transformer with Multiple Options

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

// Transformer with multiple options
registerTransformer("pad", (value, length, padString, direction) => {
  const str = String(value);
  const len = Number(length) || 10;
  const pad = String(padString || " ");
  const dir = String(direction || "end");
  
  if (dir === "start") {
    return str.padStart(len, pad);
  }
  return str.padEnd(len, pad);
});

// Use in template
// {{text pad 10 "0" "start"}}  <!-- Left pad with zeros -->
// {{text pad 10 "-" "end"}}    <!-- Right pad with dashes -->
```

### Transformer with Optional Options

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

// Transformer with optional options
registerTransformer("repeat", (value, count, separator) => {
  const str = String(value);
  const times = Number(count) || 1;
  const sep = separator !== undefined ? String(separator) : "";
  
  return Array(times).fill(str).join(sep);
});

// Use in template
// {{word repeat 3}}           <!-- "wordwordword" -->
// {{word repeat 3 ","}}      <!-- "word,word,word" -->
```

### Using the Registry Directly

You can also use the registry directly for more control:

```typescript
import { TransformerRegistry } from "@iqai/prompt-weaver";

const registry = TransformerRegistry.createScoped();

// Register transformer with options
registry.registerTransformer("customHelper", (value, option1, option2) => {
  return `Custom: ${value} (${option1}, ${option2})`;
}, {
  description: "A custom helper with two options",
  version: "1.0.0"
});

const weaver = new PromptWeaver(template, {
  registry: registry,
});

// Use in template
// {{data customHelper "opt1" "opt2"}}
```

### Transformer Options Pattern

When creating transformers with options, follow this pattern:

1. **First parameter**: Always the value being transformed
2. **Subsequent parameters**: Options passed in order from the template
3. **Optional options**: Use default values or check for `undefined`
4. **Type conversion**: Convert options to the expected types (Number, String, etc.)

Example matching the built-in `ellipsis` transformer:

```typescript
registerTransformer("ellipsis", (str: string, maxLength: number) => {
  const s = String(str);
  const length = Number(maxLength) || 50; // Default to 50 if not provided
  return s.length > length ? `${s.slice(0, length - 3)}...` : s;
});

// Use in template
// {{notes ellipsis 100}}  <!-- Truncate to 100 characters -->
// {{notes ellipsis}}      <!-- Uses default 50 characters -->
```

## ✅ Validation

### Template Validation

```typescript
import { validateTemplate } from "@iqai/prompt-weaver";

const result = validateTemplate(templateSource);
if (!result.valid) {
  console.error("Template errors:", result.errors);
}
```

### Data Validation

Validate data using Standard Schema validators (Zod, Valibot, ArkType, etc.):

```typescript
import { z } from 'zod';
import { PromptWeaver } from "@iqai/prompt-weaver";

// Define your schema
const schema = z.object({
  name: z.string().min(1),
  age: z.number().positive(),
  email: z.string().email().optional(),
});

// Create PromptWeaver with schema
const weaver = new PromptWeaver(template, { schema });

// Validate data before rendering
const result = weaver.validateSchema({ name: "Alice", age: 30 });
if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.error("Validation errors:", result.issues);
}
```

**Format with automatic validation:**

```typescript
// This validates and renders in one step
// Throws SchemaValidationError if validation fails
const output = weaver.formatWithSchema({ name: "Alice", age: 30 });
```

**Try format (returns null on validation failure):**

```typescript
const output = weaver.tryFormatWithSchema(userInput);
if (output === null) {
  console.log("Invalid input");
} else {
  console.log("Rendered:", output);
}
```

**Async validation:**

```typescript
const result = await weaver.validateSchemaAsync({ name: "Alice", age: 30 });
const output = await weaver.formatWithSchemaAsync({ name: "Alice", age: 30 });
```

> [!NOTE]
> Prompt Weaver supports any Standard Schema-compatible validation library, including:
> - **Zod** (3.24+)
> - **Valibot** (1.0+)
> - **ArkType** (2.0+)
> - And other libraries that implement the [Standard Schema](https://standardschema.dev) specification

## 🧩 Template Composition

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
import { z } from 'zod';

const schema = z.object({
  title: z.string(),
  content: z.string(),
});

const weaver = PromptWeaver.composeAndCreate(
  [header, body, footer],
  { schema }
);
```

## 🧩 Partials

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

## ⚠️ Error Handling

Enhanced error messages with context:

```typescript
import { SchemaValidationError, TemplateCompilationError } from "@iqai/prompt-weaver";
import { z } from 'zod';

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

try {
  const weaver = new PromptWeaver(template, { schema });
  const output = weaver.formatWithSchema({ name: "Alice", age: 30 });
} catch (error) {
  if (error instanceof SchemaValidationError) {
    console.error("Validation failed:", error.issues);
    console.error(error.getFormattedMessage());
    // Detailed validation error messages from your schema library
  } else if (error instanceof TemplateCompilationError) {
    console.error(error.getFormattedMessage());
    // "Template syntax error (line: 10, column: 5)"
  }
}
```

## 💡 Examples

<details>
<summary><strong>Code Review Assistant</strong></summary>

### Code Review Assistant

```typescript
const codeFence = "```";
const codeReviewTemplate = `
You are an expert code reviewer specializing in {{language}}.

## Code to Review

${codeFence}{{language}}
{{code}}
${codeFence}

## Review Criteria

{{#each criteria}}
- {{this}}
{{/each}}

## Context

- Repository: {{repoName}}
- Pull Request: #{{prNumber}}
- Author: {{authorName}}
- Files Changed: {{filesChanged}}

Please provide a thorough code review focusing on:
1. Code quality and best practices
2. Potential bugs or security issues
3. Performance optimizations
4. Test coverage recommendations

{{#if includeExamples}}
## Example Review Format

Please structure your review as:
- **Critical Issues**: List any blocking issues
- **Suggestions**: Improvement recommendations
- **Questions**: Clarifications needed
{{/if}}
`;

const weaver = new PromptWeaver(codeReviewTemplate);
const reviewPrompt = weaver.format({
  language: "TypeScript",
  code: "function calculateTotal(items: Item[]) { return items.reduce((sum, item) => sum + item.price, 0); }",
  criteria: [
    "Type safety and error handling",
    "Performance and scalability",
    "Code readability and maintainability"
  ],
  repoName: "my-app",
  prNumber: 42,
  authorName: "John Doe",
  filesChanged: 3,
  includeExamples: true
});
```

**Output:**
````
You are an expert code reviewer specializing in TypeScript.

## Code to Review

```TypeScript
function calculateTotal(items: Item[]) { return items.reduce((sum, item) => sum + item.price, 0); }
```

## Review Criteria

- Type safety and error handling
- Performance and scalability
- Code readability and maintainability

## Context

- Repository: my-app
- Pull Request: #42
- Author: John Doe
- Files Changed: 3

Please provide a thorough code review focusing on:
1. Code quality and best practices
2. Potential bugs or security issues
3. Performance optimizations
4. Test coverage recommendations

## Example Review Format

Please structure your review as:
- **Critical Issues**: List any blocking issues
- **Suggestions**: Improvement recommendations
- **Questions**: Clarifications needed
````

</details>

<details>
<summary><strong>Data Analysis Prompt</strong></summary>

### Data Analysis Prompt

```typescript
const analysisTemplate = `
You are a data analyst with expertise in {{domain}}.

## Dataset Overview

- **Total Records**: {{totalRecords integer}}
- **Date Range**: {{startDate formatDate "YYYY-MM-DD"}} to {{endDate formatDate "YYYY-MM-DD"}}
- **Key Metrics**: {{#each metrics}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

## Data Summary

{{#if hasOutliers}}
⚠️ **Note**: This dataset contains {{outlierCount}} outliers that may need special handling.
{{/if}}

## Analysis Request

{{request}}

{{#if includeVisualizations}}
## Visualization Requirements

Please suggest appropriate visualizations for:
{{#each visualizationTypes}}
- {{this}}
{{/each}}
{{/if}}

## Expected Output Format

1. **Executive Summary**: High-level insights (2-3 sentences)
2. **Key Findings**: {{findingsCount}} main observations
3. **Recommendations**: Actionable next steps
4. **Data Quality Notes**: Any concerns or limitations
`;

const analysisWeaver = new PromptWeaver(analysisTemplate);
const analysisPrompt = analysisWeaver.format({
  domain: "e-commerce",
  totalRecords: 125000,
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-03-31"),
  metrics: ["Revenue", "Conversion Rate", "Customer Lifetime Value"],
  hasOutliers: true,
  outlierCount: 47,
  request: "Analyze sales trends and identify factors contributing to revenue growth in Q1 2024.",
  includeVisualizations: true,
  visualizationTypes: ["Time series", "Cohort analysis", "Funnel visualization"],
  findingsCount: 5
});
```

**Output:**
````
You are a data analyst with expertise in e-commerce.

## Dataset Overview

- **Total Records**: 125,000
- **Date Range**: 2024-01-01 to 2024-03-31
- **Key Metrics**: Revenue, Conversion Rate, Customer Lifetime Value

## Data Summary

⚠️ **Note**: This dataset contains 47 outliers that may need special handling.

## Analysis Request

Analyze sales trends and identify factors contributing to revenue growth in Q1 2024.

## Visualization Requirements

Please suggest appropriate visualizations for:
- Time series
- Cohort analysis
- Funnel visualization

## Expected Output Format

1. **Executive Summary**: High-level insights (2-3 sentences)
2. **Key Findings**: 5 main observations
3. **Recommendations**: Actionable next steps
4. **Data Quality Notes**: Any concerns or limitations
````

</details>

<details>
<summary><strong>Content Generation Prompt</strong></summary>

### Content Generation Prompt

```typescript
const contentTemplate = `
You are a professional {{contentType}} writer with {{yearsExperience}} years of experience.

## Writing Assignment

**Topic**: {{topic}}
**Target Audience**: {{audience}}
**Tone**: {{tone}}
**Word Count**: {{targetWordCount}} words

{{#if keywords}}
## SEO Keywords

{{#each keywords}}
- {{this}}
{{/each}}
{{/if}}

## Content Structure

{{#each sections}}
{{increment @index}}. {{this}}
{{/each}}

## Guidelines

{{#each guidelines}}
- {{this}}
{{/each}}

{{#if includeExamples}}
## Reference Examples

{{#each examples}}
### Example {{increment @index}}
{{this}}
{{/each}}
{{/if}}

Please write engaging, well-researched content that:
- Captures the reader's attention from the first sentence
- Provides valuable insights and actionable information
- Maintains a consistent {{tone}} tone throughout
- Includes relevant examples and data points where appropriate
`;

const contentWeaver = new PromptWeaver(contentTemplate);
const contentPrompt = contentWeaver.format({
  contentType: "technical blog post",
  yearsExperience: 10,
  topic: "Building Scalable APIs with TypeScript",
  audience: "Senior software engineers",
  tone: "professional yet approachable",
  targetWordCount: 2000,
  keywords: ["TypeScript", "API design", "scalability", "best practices"],
  sections: [
    "Introduction to API scalability challenges",
    "TypeScript patterns for robust APIs",
    "Performance optimization techniques",
    "Real-world case studies",
    "Conclusion and next steps"
  ],
  guidelines: [
    "Use code examples to illustrate concepts",
    "Include performance benchmarks where relevant",
    "Reference industry best practices",
    "End with actionable takeaways"
  ],
  includeExamples: false
});
```

**Output:**
````
You are a professional technical blog post writer with 10 years of experience.

## Writing Assignment

**Topic**: Building Scalable APIs with TypeScript
**Target Audience**: Senior software engineers
**Tone**: professional yet approachable
**Word Count**: 2000 words

## SEO Keywords

- TypeScript
- API design
- scalability
- best practices

## Content Structure

1. Introduction to API scalability challenges
2. TypeScript patterns for robust APIs
3. Performance optimization techniques
4. Real-world case studies
5. Conclusion and next steps

## Guidelines

- Use code examples to illustrate concepts
- Include performance benchmarks where relevant
- Reference industry best practices
- End with actionable takeaways

Please write engaging, well-researched content that:
- Captures the reader's attention from the first sentence
- Provides valuable insights and actionable information
- Maintains a consistent professional yet approachable tone throughout
- Includes relevant examples and data points where appropriate
````

</details>

<details>
<summary><strong>Customer Support Prompt</strong></summary>

### Customer Support Prompt

```typescript
const supportTemplate = `
You are a customer support specialist for {{companyName}}.

## Customer Information

- **Name**: {{customerName}}
- **Account Type**: {{accountType}}
- **Member Since**: {{memberSince formatDate "MMMM YYYY"}}
{{#if isPremium}}
- ⭐ **Premium Member**
{{/if}}

## Issue Details

**Ticket ID**: {{ticketId}}
**Category**: {{category}}
**Priority**: {{priority upper}}
**Reported**: {{reportedAt relativeTime}}

**Description**:
{{issueDescription}}

{{#if previousTickets}}
## Previous Interactions

This customer has {{previousTickets.length}} previous ticket{{pluralize "ticket" previousTickets.length}}:
{{#each previousTickets}}
- Ticket #{{ticketNumber}}: {{summary}} ({{status}})
{{/each}}
{{/if}}

{{#if orderHistory}}
## Recent Order History

{{#each orderHistory}}
- Order #{{orderNumber}}: {{productName}} - {{orderDate formatDate "MMM DD, YYYY"}} - {{status capitalize}}
{{/each}}
{{/if}}

## Response Guidelines

1. Acknowledge the customer's concern with empathy
2. Provide a clear, step-by-step solution
3. {{#if isPremium}}Offer priority escalation if needed{{else}}Suggest self-service options where appropriate{{/if}}
4. Set clear expectations for resolution timeline
5. End with a warm, helpful closing

Please draft a professional, helpful response that resolves their issue.
`;

const supportWeaver = new PromptWeaver(supportTemplate);
const supportPrompt = supportWeaver.format({
  companyName: "TechCorp",
  customerName: "Sarah Johnson",
  accountType: "Business",
  memberSince: new Date("2023-06-15"),
  isPremium: true,
  ticketId: "TC-2024-0847",
  category: "Billing",
  priority: "high",
  reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  issueDescription: "I was charged twice for my subscription renewal. The charge appeared on both my credit card and PayPal account.",
  previousTickets: [
    { ticketNumber: "TC-2024-0721", summary: "Feature request", status: "resolved" }
  ],
  orderHistory: [
    { orderNumber: "ORD-1234", productName: "Pro Plan", orderDate: new Date("2024-03-01"), status: "completed" }
  ]
});
```

**Output:**
````
You are a customer support specialist for TechCorp.

## Customer Information

- **Name**: Sarah Johnson
- **Account Type**: Business
- **Member Since**: June 2023
- ⭐ **Premium Member**

## Issue Details

**Ticket ID**: TC-2024-0847
**Category**: Billing
**Priority**: HIGH
**Reported**: 2 hours ago

**Description**:
I was charged twice for my subscription renewal. The charge appeared on both my credit card and PayPal account.

## Previous Interactions

This customer has 1 previous ticket:
- Ticket #TC-2024-0721: Feature request (resolved)

## Recent Order History

- Order #ORD-1234: Pro Plan - Mar 01, 2024 - Completed

## Response Guidelines

1. Acknowledge the customer's concern with empathy
2. Provide a clear, step-by-step solution
3. Offer priority escalation if needed
4. Set clear expectations for resolution timeline
5. End with a warm, helpful closing

Please draft a professional, helpful response that resolves their issue.
````

</details>

<details>
<summary><strong>Programmatic Prompt Building</strong></summary>

### Programmatic Prompt Building

Build prompts dynamically based on runtime conditions:

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const builder = new PromptBuilder()
  .heading(1, "AI Code Assistant")
  .section("Role", "You are an expert software engineer specializing in {{language}}.")
  .section("Task", "{{taskDescription}}");

// Conditionally add context section
if (includeContext) {
  builder
    .heading(2, "Context")
    .text("Current codebase:")
    .code(existingCode, "typescript")
    .text(`\nRelated files: ${relatedFiles.join(", ")}`);
}

// Build requirements section
builder.section("Requirements", () => {
  const reqBuilder = new PromptBuilder().list(requirements);
  if (hasConstraints) {
    reqBuilder.heading(3, "Constraints").list(constraints);
  }
  return reqBuilder.build();
});

builder.section("Output Format", "Please provide:\n1. Complete code solution\n2. Brief explanation\n3. Testing recommendations");

// Convert to PromptWeaver and render with data
const weaver = builder.toPromptWeaver();
const output = weaver.format({
  language: "TypeScript",
  taskDescription: "Create a function to calculate Fibonacci numbers",
  // ... other data
});
```

**Key Benefits:**
- Build prompts programmatically with full control flow
- Use conditionals, loops, and dynamic content
- Convert to PromptWeaver for template rendering with variables
- Validate data against the built template

</details>

## 🔷 TypeScript Support

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

---

<div align="center">

Built with 💙 by IQ AI Team

</div>
