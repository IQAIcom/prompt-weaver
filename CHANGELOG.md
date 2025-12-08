# @iqai/prompt-weaver

## 1.1.1

### Patch Changes

- db8eb5d: Refactor template validation to use Handlebars AST instead of regex. This internal improvement makes the code more maintainable and robust by leveraging Handlebars' built-in parser instead of complex regex patterns. No changes to the public API or behavior.

## 1.1.0

### Minor Changes

- 3ad2d0e: ## Performance Improvements

  - Add template compilation caching (configurable via `enableCache` option, defaults to true)
  - Optimize partial compilation - partials are now pre-compiled when registered for better rendering performance

  ## API Enhancements

  - **PromptBuilder**: Add new methods for richer prompt building:
    - `json(data, indent?)` - Format JSON data with indentation
    - `link(text, url)` - Create markdown links
    - `image(alt, url, title?)` - Create markdown images
    - `checkbox(text, checked?)` / `checkboxes(items)` - Create task lists
    - `horizontalRule(char?)` - Alias for separator
  - **Collection transformers**: Enhanced `filter` and `reduce` helpers:
    - `filter` now supports property-value filtering: `{{filter users "status" "active"}}`
    - `reduce` now supports operations: `sum`, `multiply`, `max`, `min`, `concat`

  ## Date Formatting Enhancements

  - Add support for additional date format patterns:
    - `MMMM` (full month name), `MMM` (abbreviated month)
    - `DDDD` (full day name), `DDD` (abbreviated day)
    - `YY` (2-digit year), `M` (single digit month), `D` (single digit day)

  ## Developer Experience

  - **Enhanced error messages**: Template compilation errors now include surrounding code context, line numbers, and helpful suggestions
  - **Improved variable extraction**: Better handling of array access, helper expressions, and complex expressions in templates
  - **Standardized error handling**: Created `src/utils/error-handling.ts` with consistent error handling utilities for transformers

  ## Documentation & Security

  - Fix outdated security documentation - removed deprecated options, updated examples to use current Standard Schema validation API
  - Update README.md and TRANSFORMERS.md with new features and examples

  ## Testing

  - Add comprehensive edge case tests covering null/undefined handling, empty collections, large templates, and error recovery scenarios

### Patch Changes

- d451efb: Adds fixes to some transformers and extends test suite

## 1.0.4

### Patch Changes

- afc5d52: `format()` now automatically validates data against the schema when a schema is provided. No need for separate validation methods!

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
