# @iqai/prompt-weaver

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
