---
"@iqai/prompt-weaver": minor
---

## Performance Improvements
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

