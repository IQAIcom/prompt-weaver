<div align="center">

# Prompt Weaver - Craft Powerful Prompts with Ease

A powerful, extensible template engine for building prompts. Prompt Weaver provides a comprehensive set of transformers, validation utilities, and a fluent API for programmatic prompt construction.

</div>

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
  strict?: boolean; // Warn about extra variables
  throwOnMissing?: boolean; // Throw error on missing required variables
  helpers?: Record<string, TemplateHelper>; // Additional helpers
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

### Code Review Assistant

```typescript
const codeReviewTemplate = `
You are an expert code reviewer specializing in {{language}}.

## Code to Review

\`\`\`{{language}}
{{code}}
\`\`\`

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
```
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
```

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

### Programmatic Prompt Building

```typescript
const builder = new PromptBuilder();

const prompt = builder
  .heading(1, "AI Code Assistant")
  .section("Role", "You are an expert software engineer specializing in {{language}}.")
  .section("Task", "{{taskDescription}}")
  .conditional(includeContext, () => {
    return builder
      .heading(2, "Context")
      .text("Current codebase:")
      .code(existingCode, "typescript")
      .text(`\nRelated files: ${relatedFiles.join(", ")}`);
  })
  .section("Requirements", () => {
    return builder
      .list(requirements)
      .conditional(hasConstraints, () => {
        return builder
          .heading(3, "Constraints")
          .list(constraints);
      });
  })
  .section("Output Format", "Please provide:\n1. Complete code solution\n2. Brief explanation\n3. Testing recommendations")
  .build();

const weaver = new PromptWeaver(prompt);
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
