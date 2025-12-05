---
"@iqai/prompt-weaver": patch
---

Fix type inference for schema validation methods

- `formatWithSchema()` now properly infers input type from schema instead of accepting `unknown`
- `formatWithSchemaAsync()` now properly infers input type from schema
- `tryFormatWithSchema()` now properly infers input type from schema
- `PromptWeaver.composeAndCreate()` now preserves schema type parameter
- `PromptBuilder.toPromptWeaver()` now preserves schema type parameter

This enables full compile-time type safety when using Standard Schema validators (Zod, Valibot, ArkType, etc.)

