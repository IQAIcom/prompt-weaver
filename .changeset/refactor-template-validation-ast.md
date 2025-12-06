---
"@iqai/prompt-weaver": patch
---

Refactor template validation to use Handlebars AST instead of regex. This internal improvement makes the code more maintainable and robust by leveraging Handlebars' built-in parser instead of complex regex patterns. No changes to the public API or behavior.
