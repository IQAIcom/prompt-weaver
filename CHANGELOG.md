# @iqai/prompt-weaver

## 1.0.3

### Patch Changes

- f4bd4f5: refactor: Remove helpers/transformers array options and enhance README with better examples
- eea5c0b: Removes helpers

## 1.0.2

### Patch Changes

- 78ff0fc: Fix type inference for schema validation methods

  - `formatWithSchema()` now properly infers input type from schema instead of accepting `unknown`
  - `formatWithSchemaAsync()` now properly infers input type from schema
  - `tryFormatWithSchema()` now properly infers input type from schema
  - `PromptWeaver.composeAndCreate()` now preserves schema type parameter
  - `PromptBuilder.toPromptWeaver()` now preserves schema type parameter

  This enables full compile-time type safety when using Standard Schema validators (Zod, Valibot, ArkType, etc.)

## 1.0.1

### Patch Changes

- 79b9d80: Applying the patch: replacing index.mjs with index.js in the module field and the import export.

## 1.0.0

### Major Changes

- fea37a6: Add Standard Schema validation support

  - Implement Standard Schema (https://standardschema.dev) validation integration
  - Add `schema` option to `PromptWeaverOptions` to accept Standard Schema validators
  - Add new validation methods: `validateSchema()`, `formatWithSchema()`, `createSchemaFormatter()`, etc.
  - Add standalone validation utilities: `validateWithSchema()`, `parseWithSchema()`, `createSafeParser()`, etc.
  - Remove old data validation system (`validateData()`, `ValidationError`, `strict`/`throwOnMissing` options)
  - Works with any Standard Schema compliant library (Zod, Valibot, ArkType, Yup, Joi, etc.)

  BREAKING CHANGE: Removed `ValidationError`, `validateData()`, `PromptWeaver.validate()`, and `strict`/`throwOnMissing` options. Use Standard Schema validation instead.
