<div align="center">

<img src="./logo.png" alt="Prompt Weaver Logo" width="100">

# Prompt Weaver

**Craft Powerful, Type-Safe LLM Prompts with Ease**

A powerful, extensible template engine built for the AI era. Prompt Weaver combines the flexibility of Handlebars with the safety of TypeScript and Zod/Standard Schema.

[Features](#-features) • [Quick Start](#-quick-start) • [The Two Approaches](#️-the-two-approaches-builder-vs-weaver) • [Templating Syntax](#-templating-syntax-handlebars) • [Transformers](#️-built-in-transformers) • [Type Safety](#-validation--type-safety)

</div>

-----

## 📖 Introduction

Writing prompts for LLMs often involves messy string concatenation, zero type safety, and repetitive code. **Prompt Weaver** solves this by treating prompts like software artifacts.

It allows you to build dynamic prompts using **templates**, validate input data with **schemas** (Zod, Valibot, etc.), and transform data (dates, currency, arrays) directly within the prompt.

## ✨ Features

- **🎨 Powerful Templating**: Logic-rich templates with loops (`{{#each}}`), conditionals (`{{#if}}`), and switch/case logic.

- **✅ Type Safety & Validation**: First-class support for **Standard Schema** (Zod, ArkType, Valibot). Get automatic TypeScript type inference.

- **🔧 Rich Toolset**: Built-in transformers for Dates, Strings, JSON, Currencies, and Arrays.

- **🏗️ Fluent Builder API**: Construct prompts programmatically using a chainable JavaScript/TypeScript API.

- **🧩 Reusable Partials**: Don't repeat yourself—compose prompts from reusable fragments (headers, footers, rules).

- **🎯 Extensible**: Create custom transformers and helpers to suit your specific domain.

-----

## 📦 Installation

```bash
npm install @iqai/prompt-weaver

# or

pnpm add @iqai/prompt-weaver

# or

yarn add @iqai/prompt-weaver
```

-----

## 🚀 Quick Start

### 1. The "Hello World"

Start simple. Define a template, inject data, and get a string.

```typescript
import { PromptWeaver } from "@iqai/prompt-weaver";

// 1. Define a template with variables and a transformer
const template = "Hello {{name}}, your balance is {{balance currency}}.";

// 2. Initialize Weaver
const weaver = new PromptWeaver(template);

// 3. Render
const result = weaver.format({
  name: "Alice",
  balance: 1234.56
});

console.log(result);
// Output: "Hello Alice, your balance is $1,234.56."
```

### 2. The Feature Showcase

Here is a more complex example showing loops, conditionals, and formatting.

<details>
<summary><strong>View Complex Example Code</strong></summary>

```typescript
const template = `
You are helping {{userName}}.

## Task Details

- **Deadline**: {{deadline relativeTime}} ({{deadline formatDate "MMM DD"}})
- **Status**: {{#if isPremium}}⭐ Premium{{else}}Standard{{/if}}

## Requirements

{{#each requirements}}
{{increment @index}}. {{this}}
{{/each}}
`;

const weaver = new PromptWeaver(template);

const output = weaver.format({
  userName: "Alice",
  isPremium: true,
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  requirements: ["Plan project", "Review code"]
});
```

**Output:**

```text
You are helping Alice.

## Task Details

- **Deadline**: in 7 days (Dec 12)
- **Status**: ⭐ Premium

## Requirements

1. Plan project
2. Review code
```

</details>

-----

## ⚖️ The Two Approaches: Builder vs. Weaver

Prompt Weaver offers two ways to create prompts. You can use them separately or together.

| Feature | **PromptWeaver** | **PromptBuilder** |
| :--- | :--- | :--- |
| **Best For...** | Static templates, recurring tasks, separating content from code. | Dynamic logic, building prompts on the fly based on runtime conditions. |
| **Input** | String template (Handlebars syntax). | Method chaining (Fluent API). |
| **Example** | `new PromptWeaver("Hello {{name}}")` | `new PromptBuilder().text("Hello").text(name)` |

### Using the Builder (Fluent API)

Perfect for when you need to construct a prompt logically in your code.

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

const builder = new PromptBuilder()
  .heading(1, "User Profile")
  .section("Info", "Name: {{name}}")
  .list(["Rule 1", "Rule 2"])
  .conditional(true, "✅ Verified", "❌ Unverified");

// Convert to Weaver to render data
const weaver = builder.toPromptWeaver();
const output = weaver.format({ name: "Alice" });
```

### When to Use Each Approach

| Scenario | Use Builder | Use Weaver | Use Both |
|----------|-------------|------------|----------|
| Static template strings | ❌ | ✅ | ❌ |
| Dynamic prompt construction | ✅ | ❌ | ✅ |
| Template rendering with data | ❌ | ✅ | ✅ |
| Reusable templates | ❌ | ✅ | ✅ |
| Complex programmatic logic | ✅ | ❌ | ✅ |

### Workflow: Build → Convert → Render

```typescript
import { PromptBuilder } from "@iqai/prompt-weaver";

// Step 1: Build programmatically
const builder = new PromptBuilder()
  .heading(1, "User Dashboard")
  .section("Welcome", "Hello {{userName}}!")
  .section("Account Info", "Your balance is {{balance currency}}")
  .conditional(isPremium, "⭐ Premium Member", "Upgrade to Premium");

// Step 2: Convert to PromptWeaver for rendering
const weaver = builder.toPromptWeaver();

// Step 3: Render with data (can be called multiple times)
const output1 = weaver.format({ userName: "Alice", balance: 1000, isPremium: true });
const output2 = weaver.format({ userName: "Bob", balance: 500, isPremium: false });

// Step 4: Optional - Validate with schema (TypeScript infers types automatically)
import { z } from 'zod';
const schema = z.object({
  userName: z.string(),
  balance: z.number(),
  isPremium: z.boolean(),
});

// TypeScript automatically infers types from the schema
const weaverWithSchema = builder.toPromptWeaver({ schema });

// formatWithSchema() is now type-safe - TypeScript knows the exact shape
const validatedOutput = weaverWithSchema.formatWithSchema({ 
  userName: "Alice", 
  balance: 1000, 
  isPremium: true 
});
```

-----

## 🎨 Templating Syntax (Handlebars)

Prompt Weaver utilizes Handlebars syntax for control flow and data formatting.

### Variable Interpolation & Transformers

Variables are interpolated using `{{variableName}}`. You can format variables in different ways by adding **transformers** after the variable name:

```handlebars
{{variableName transformer}}
{{variableName transformer arg1 arg2}}
```

**Basic variable:**
```handlebars
Hello {{name}}!
```

**With transformer:**
```handlebars
Hello {{name capitalize}}!          <!-- Capitalizes the name -->
Your balance is {{balance currency}}  <!-- Formats as currency: $1,234.56 -->
Due {{deadline relativeTime}}        <!-- Shows relative time: "in 3 days" -->
```

**Transformers with arguments:**
```handlebars
{{text ellipsis 50}}                  <!-- Truncate to 50 chars -->
{{date formatDate "YYYY-MM-DD"}}      <!-- Format date with pattern -->
{{text replace "old" "new"}}          <!-- Replace text -->
```

**Chaining transformers in expressions:**
```handlebars
{{#each (sort (filter users "active") "name")}}
  {{increment @index}}. {{name capitalize}} - {{balance currency}}
{{/each}}
```

Transformers allow you to format data directly within your templates without preprocessing. See the [Built-in Transformers](#️-built-in-transformers) section below for available options.

### Loops

```handlebars
{{#each items}}
  {{increment @index}}. {{this}}
{{else}}
  No items found.
{{/each}}
```

### Conditionals

```handlebars
{{#if isPremium}}
  Premium Content
{{else}}
  Standard Content
{{/if}}
```

### Switch/Case

```handlebars
{{#switch role}}
  {{#case "admin"}} You are an Admin {{/case}}
  {{#case "user"}} You are a User {{/case}}
{{/switch}}
```

### Context Switching

```handlebars
{{#with user}}
  Name: {{name}}
  Email: {{email}}
{{/with}}
```

### Special Variables

- `@index` - Current index in `{{#each}}` loops (0-based)
- `@key` - Current key in `{{#each}}` loops over objects
- `@first` - `true` on first iteration
- `@last` - `true` on last iteration
- `@root` - Access root context from nested contexts
- `this` - Current context value in loops

### Partials (Reusable Fragments)

Define common pieces (like headers) once and reuse them.

```typescript
const weaver = new PromptWeaver(mainTemplate, {
  partials: {
    header: "Role: {{role}}\nTask: {{task}}",
    footer: "Answer in JSON format."
  }
});
```

Usage in template: `{{> header}}` or `{{> footer}}`.

You can also register partials programmatically:

```typescript
const weaver = new PromptWeaver(mainTemplate);
weaver.setPartial("header", "<header>{{title}}</header>");
weaver.setPartial("footer", "<footer>Footer</footer>");
```

-----

## 🛠️ Built-in Transformers

Prompt Weaver comes with a massive library of transformers to format data directly inside your prompt.

### 📝 String & Content

<details>
<summary>Expand String Transformers</summary>

| Transformer | Example | Result |
| :--- | :--- | :--- |
| `upper` | `{{text upper}}` | HELLO |
| `lower` | `{{text lower}}` | hello |
| `capitalize` | `{{text capitalize}}` | Hello |
| `ellipsis` | `{{text ellipsis 10}}` | Hello w... |
| `json` | `{{data json}}` | `{"a":1}` |
| `pluralize` | `{{word pluralize}}` | apples |

📖 **[View all String Transformers →](TRANSFORMERS.md#-string--content-transformers)**

</details>

### 📅 Date & Time

<details>
<summary>Expand Date Transformers</summary>

| Transformer | Example | Result |
| :--- | :--- | :--- |
| `formatDate` | `{{date formatDate "YYYY-MM-DD"}}` | 2023-12-25 |
| `relativeTime` | `{{date relativeTime}}` | 2 hours ago |
| `isToday` | `{{date isToday}}` | true/false |
| `timestamp` | `{{date timestamp}}` | 1640995200000 |

📖 **[View all Date Transformers →](TRANSFORMERS.md#-date--time-transformers)**

</details>

### 🔢 Math & Numbers

<details>
<summary>Expand Number Transformers</summary>

| Transformer | Example | Result |
| :--- | :--- | :--- |
| `currency` | `{{price currency}}` | $1,234.56 |
| `percent` | `{{val percentage}}` | 12.34% |
| `compact` | `{{views large compact}}` | 1.2M |
| `add` | `{{add 5 2}}` | 7 |

📖 **[View all Number Transformers →](TRANSFORMERS.md#-math--number-transformers)**

</details>

### 📊 Collections (Arrays/Objects)

<details>
<summary>Expand Collection Transformers</summary>

| Transformer | Example | Description |
| :--- | :--- | :--- |
| `filter` | `{{filter users "active"}}` | Filter array by property |
| `map` | `{{map users "name"}}` | Extract property from objects |
| `sort` | `{{sort items "price"}}` | Sort array |
| `first` / `last` | `{{first items}}` | Get first/last item |
| `pick` | `{{pick user "name" "id"}}` | Pick specific object keys |

📖 **[View all Collection Transformers →](TRANSFORMERS.md#-collection-transformers-arrays)**

</details>

### 🔀 Logic & Comparison

<details>
<summary>Expand Logic Transformers</summary>

```handlebars
{{#if (eq status "active")}} ... {{/if}}
{{#if (gt age 18)}} ... {{/if}}
{{coalesce value "fallback"}}
{{ifElse isPremium "Rich" "Poor"}}
```

📖 **[View all Logic & Comparison Transformers →](TRANSFORMERS.md#-logic--comparison-transformers)**

</details>

> 📚 **Complete Reference**: See [TRANSFORMERS.md](TRANSFORMERS.md) for the full list of all available transformers with detailed examples and usage.

-----

## ✅ Validation & Type Safety

This is where Prompt Weaver shines. By integrating **Standard Schema** (Zod, Valibot, ArkType), you get runtime validation AND build-time TypeScript inference automatically.

### The "Magic" of Inference

You don't need to manually define interfaces. Just pass a schema.

```typescript
import { z } from 'zod';
import { PromptWeaver } from "@iqai/prompt-weaver";

// 1. Define Schema
const schema = z.object({
  username: z.string(),
  age: z.number().positive(),
  email: z.string().email().optional()
});

// 2. Pass schema to Weaver
const weaver = new PromptWeaver(template, { schema });

// 3. Type-Safe Formatting
// TypeScript will now ERROR if you miss 'username' or if 'age' is a string!
const output = weaver.formatWithSchema({
  username: "Alice", 
  age: 30,
  // email is optional, so we can omit it safely
});
```

### Validation Methods

- `weaver.formatWithSchema(data)`: Validates, renders, and throws error if invalid.
- `weaver.tryFormatWithSchema(data)`: Returns `null` on failure instead of throwing.
- `weaver.validateSchema(data)`: Just runs validation, returning a success/failure object.

**Example:**

```typescript
// Validate data before rendering (also type-safe)
const result = weaver.validateSchema({ username: "Alice", age: 30 });
if (result.success) {
  console.log("Valid data:", result.data); // ✅ TypeScript infers the output type
} else {
  console.error("Validation errors:", result.issues);
}

// Try format (returns null on validation failure, still type-safe)
const output = weaver.tryFormatWithSchema(userInput);
if (output === null) {
  console.log("Invalid input");
} else {
  console.log("Rendered:", output);
}
```

**Async validation:**

```typescript
const result = await weaver.validateSchemaAsync({ username: "Alice", age: 30 });
const output = await weaver.formatWithSchemaAsync({ username: "Alice", age: 30 });
```

> [!NOTE]
> Prompt Weaver supports any Standard Schema-compatible validation library, including:
> - **Zod** (3.24+)
> - **Valibot** (1.0+)
> - **ArkType** (2.0+)
> - And other libraries that implement the [Standard Schema](https://standardschema.dev) specification

### Template Validation

```typescript
import { validateTemplate } from "@iqai/prompt-weaver";

const result = validateTemplate(templateSource);
if (!result.valid) {
  console.error("Template errors:", result.errors);
}
```

-----

## 🧩 Advanced Usage

### Composition

Merge multiple templates into one context.

```typescript
const composed = PromptWeaver.compose([headerTemplate, bodyTemplate, footerTemplate]);
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
  [headerTemplate, bodyTemplate, footerTemplate],
  { schema }
);
```

### Custom Transformers

Register your own logic globally or scoped to an instance.

**Global Registration (Simple):**

```typescript
import { registerTransformer } from "@iqai/prompt-weaver";

// Simple transformer (no options)
registerTransformer("reverse", (str) => str.split("").reverse().join(""));
// Use: {{ text reverse }}

// Transformer with options
registerTransformer("truncate", (value, maxLength) => {
  const str = String(value);
  const length = Number(maxLength) || 50;
  return str.length > length ? `${str.slice(0, length - 3)}...` : str;
});
// Use: {{longText truncate 100}}
```

**Scoped Registry (Isolation):**

```typescript
import { TransformerRegistry } from "@iqai/prompt-weaver";

// Create isolated registry
const registry = TransformerRegistry.createScoped();
registry.registerTransformer("customHelper", (value, option1, option2) => {
  return `Custom: ${value} (${option1}, ${option2})`;
}, {
  description: "A custom helper with two options",
  version: "1.0.0"
});

// Only this instance uses this registry
const weaver = new PromptWeaver(template, { registry });
```

**When to use which:**
- **Global registration** (`registerTransformer()`) - Use for shared transformers across your app
- **Scoped registry** (`TransformerRegistry.createScoped()`) - Use for isolation, testing, or per-instance transformer sets

### Core API Methods

**PromptWeaver Class:**

```typescript
// Constructor
new PromptWeaver(templateSource, options?)

// Options
interface PromptWeaverOptions {
  registry?: TransformerRegistry; // Custom transformer registry (defaults to global)
  partials?: Record<string, string>; // Partial templates
  schema?: StandardSchemaV1; // Standard Schema validator (Zod, Valibot, ArkType, etc.)
}

// Methods
weaver.format(data)                    // Render the template with data
weaver.validateSchema(data)            // Validate data against schema (requires schema option)
weaver.formatWithSchema(data)          // Format with automatic validation (throws on failure)
weaver.tryFormatWithSchema(data)       // Format with validation (returns null on failure)
weaver.extractVariables()              // Get required variables from template
weaver.setPartial(name, templateSource) // Register a partial template
weaver.getMetadata()                   // Get template metadata
PromptWeaver.compose(templateSources, separator?) // Compose multiple templates (static)
```

**PromptBuilder Methods:**

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

-----

## 💡 Real-World Examples

<details>
<summary><strong>🤖 Code Review Assistant</strong></summary>

Generates a structured prompt for reviewing PRs, handling code blocks and arrays of criteria.

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

</details>

<details>
<summary><strong>📊 Data Analysis</strong></summary>

Takes raw data numbers and dates, formats them readable, and adds warnings if outliers are detected.

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

</details>

<details>
<summary><strong>📞 Customer Support</strong></summary>

Formats a customer ticket with history, deciding tone based on "Premium" status variables.

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

</details>

<details>
<summary><strong>🏗️ Programmatic Prompt Building</strong></summary>

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

-----

## ⚠️ Error Handling

Prompt Weaver provides specific error classes for debugging.

- `SchemaValidationError`: Thrown when data doesn't match your Zod/Valibot schema.
- `TemplateCompilationError`: Thrown when your Handlebars syntax is broken (e.g., unclosed tags).

**Example:**

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

-----

<div align="center">

Built with 💙 by IQ AI Team

</div>
