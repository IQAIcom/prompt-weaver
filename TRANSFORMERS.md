# Transformers Reference

Complete reference guide for all built-in transformers available in Prompt Weaver.

Transformers are used within Handlebars templates to format and manipulate data. Use them with the syntax: `{{transformer variable}}` or `{{transformer variable arg1 arg2}}`.

---

## 📝 String & Content Transformers

### Case Conversion

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `upper` | `{{upper text}}` | Convert to uppercase | `"hello"` → `"HELLO"` |
| `lower` | `{{lower text}}` | Convert to lowercase | `"HELLO"` → `"hello"` |
| `capitalize` | `{{capitalize text}}` | Capitalize first letter | `"hello"` → `"Hello"` |

### String Manipulation

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `replace` | `{{replace text "old" "new"}}` | Replace first occurrence | `"hello world"` → `"hello neworld"` |
| `replaceAll` | `{{replaceAll text " " "-"}}` | Replace all occurrences | `"hello world"` → `"hello-world"` |
| `regexReplace` | `{{regexReplace text "\\d+" "NUM"}}` | Regex replace | `"abc123"` → `"abcNUM"` |
| `slice` | `{{slice text 0 5}}` | Extract substring | `"hello"` → `"hello"` |
| `substring` | `{{substring text 1 4}}` | Extract substring | `"hello"` → `"ell"` |
| `trim` | `{{trim text}}` | Remove leading/trailing whitespace | `" hello "` → `"hello"` |
| `trimStart` | `{{trimStart text}}` | Remove leading whitespace | `" hello"` → `"hello"` |
| `trimEnd` | `{{trimEnd text}}` | Remove trailing whitespace | `"hello "` → `"hello"` |

### Padding

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `padStart` | `{{padStart text 10 "0"}}` | Pad start with character | `"5"` → `"0000000005"` |
| `padEnd` | `{{padEnd text 10 " "}}` | Pad end with character | `"hello"` → `"hello     "` |

### Truncation

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `truncate` | `{{truncate text}}` | Truncate to 50 chars with ellipsis | `"very long text..."` → `"very long text..."` |
| `ellipsis` | `{{ellipsis text 10}}` | Truncate to N chars with ellipsis | `"hello world"` → `"hello w..."` |

### Case Formatting

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `slugify` | `{{slugify text}}` | Convert to URL slug | `"Hello World!"` → `"hello-world"` |
| `kebabCase` | `{{kebabCase text}}` | Convert to kebab-case | `"helloWorld"` → `"hello-world"` |
| `camelCase` | `{{camelCase text}}` | Convert to camelCase | `"hello world"` → `"helloWorld"` |
| `snakeCase` | `{{snakeCase text}}` | Convert to snake_case | `"hello world"` → `"hello_world"` |

### Word Inflection

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `pluralize` | `{{pluralize word}}` | Pluralize word | `"apple"` → `"apples"` |
| `pluralize` | `{{pluralize word count}}` | Pluralize based on count | `pluralize "apple" 1` → `"apple"` |
| `singularize` | `{{singularize word}}` | Singularize word | `"apples"` → `"apple"` |

### Array/String Conversion

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `split` | `{{split text ","}}` | Split string into array | `"a,b,c"` → `["a", "b", "c"]` |
| `join` | `{{join array ", "}}` | Join array into string | `["a", "b"]` → `"a, b"` |

### JSON & Data

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `json` | `{{json data}}` | Convert to JSON string | `{a: 1}` → `"{\"a\":1}"` |

---

## 📅 Date & Time Transformers

### Date Formatting

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `formatDate` | `{{formatDate date "YYYY-MM-DD"}}` | Format date with pattern | `new Date()` → `"2024-12-15"` |
| `formatTime` | `{{formatTime date}}` | Format time only | `new Date()` → `"3:45:30 PM"` |
| `formatDateTime` | `{{formatDateTime date}}` | Format date and time | `new Date()` → `"12/15/2024, 3:45:30 PM"` |

**Date Format Patterns:**
- `YYYY` - Full year (e.g., 2024)
- `MM` - Month (01-12)
- `DD` - Day (01-31)
- `HH` - Hours (00-23)
- `mm` - Minutes (00-59)
- `ss` - Seconds (00-59)

### Relative Time

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `relativeTime` | `{{relativeTime date}}` | Human-readable relative time | `2 hours ago` or `in 3 days` |

### Date Comparisons

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `isToday` | `{{isToday date}}` | Check if date is today | Returns `true` or `false` |
| `isPast` | `{{isPast date}}` | Check if date is in the past | Returns `true` or `false` |
| `isFuture` | `{{isFuture date}}` | Check if date is in the future | Returns `true` or `false` |

### Date Arithmetic

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `addDays` | `{{addDays date 7}}` | Add days to date | Returns new Date |
| `subtractDays` | `{{subtractDays date 3}}` | Subtract days from date | Returns new Date |
| `addHours` | `{{addHours date 2}}` | Add hours to date | Returns new Date |
| `subtractHours` | `{{subtractHours date 1}}` | Subtract hours from date | Returns new Date |
| `addMinutes` | `{{addMinutes date 30}}` | Add minutes to date | Returns new Date |
| `subtractMinutes` | `{{subtractMinutes date 15}}` | Subtract minutes from date | Returns new Date |

### Timestamp Conversion

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `timestamp` | `{{timestamp date}}` | Get milliseconds timestamp | `1640995200000` |
| `unixTimestamp` | `{{unixTimestamp date}}` | Get Unix timestamp (seconds) | `1640995200` |

---

## 🔢 Math & Number Transformers

### Arithmetic Operations

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `add` | `{{add 5 2}}` | Add two numbers | `7` |
| `subtract` | `{{subtract 5 2}}` | Subtract two numbers | `3` |
| `multiply` | `{{multiply 5 2}}` | Multiply two numbers | `10` |
| `divide` | `{{divide 10 2}}` | Divide two numbers | `5` |
| `increment` | `{{increment value}}` | Add 1 to number | `5` → `6` |

### Number Formatting

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `currency` | `{{currency price}}` | Format as currency | `1234.56` → `"$1,234.56"` |
| `price` | `{{price value}}` | Format as price (4 decimals) | `0.1234` → `"$0.1234"` |
| `percent` | `{{percent val}}` | Format as percentage | `12.34` → `"12.34%"` |
| `signedPercent` | `{{signedPercent change}}` | Signed percentage | `12.34` → `"+12.34%"` |
| `signedCurrency` | `{{signedCurrency amount}}` | Signed currency | `1234.56` → `"+$1,234.56"` |
| `integer` | `{{integer count}}` | Format as integer with commas | `1234` → `"1,234"` |
| `number` | `{{number value}}` | Format number with commas | `1234.56` → `"1,234.56"` |
| `compact` | `{{compact views}}` | Compact notation | `1200000` → `"1.2M"` |

---

## 📊 Collection Transformers (Arrays)

### Array Access

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `first` | `{{first items}}` | Get first item | `[1,2,3]` → `1` |
| `last` | `{{last items}}` | Get last item | `[1,2,3]` → `3` |
| `nth` | `{{nth items 1}}` | Get item at index | `[1,2,3]` → `2` |
| `length` | `{{length items}}` | Get array length | `[1,2,3]` → `3` |

### Array Operations

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `filter` | `{{filter users "active"}}` | Filter array by property | Filters items where property is truthy |
| `map` | `{{map users "name"}}` | Extract property from objects | `[{name:"A"}]` → `["A"]` |
| `find` | `{{find users "id" 123}}` | Find item by property/value | Returns matching object |
| `findIndex` | `{{findIndex users "id" 123}}` | Find index by property/value | Returns index or -1 |
| `includes` | `{{includes items value}}` | Check if array includes value | Returns `true` or `false` |
| `sort` | `{{sort items "price"}}` | Sort array by property | Returns sorted array |
| `sort` | `{{sort items}}` | Sort array (no property) | Returns sorted array |
| `reverse` | `{{reverse items}}` | Reverse array | `[1,2,3]` → `[3,2,1]` |
| `unique` | `{{unique items}}` | Get unique values | `[1,2,2,3]` → `[1,2,3]` |
| `chunk` | `{{chunk items 3}}` | Split into chunks of size N | `[1,2,3,4,5]` → `[[1,2,3],[4,5]]` |
| `flatten` | `{{flatten items}}` | Flatten nested arrays | `[[1,2],[3]]` → `[1,2,3]` |
| `arraySlice` | `{{arraySlice items 0 5}}` | Slice array | `[1,2,3,4,5,6]` → `[1,2,3,4,5]` |

### Array Grouping

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `groupBy` | `{{groupBy users "role"}}` | Group by property | Returns object with grouped arrays |
| `partition` | `{{partition users "active"}}` | Partition into true/false groups | Returns `{true: [...], false: [...]}` |
| `reduce` | `{{reduce items 0}}` | Reduce array (basic sum) | Sums numeric values |

---

## 🗂️ Object Transformers

### Object Access

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `get` | `{{get obj "key"}}` | Get property value | `{a:1}` → `1` |
| `has` | `{{has obj "key"}}` | Check if property exists | Returns `true` or `false` |
| `keys` | `{{keys obj}}` | Get all keys | `{a:1,b:2}` → `["a","b"]` |
| `values` | `{{values obj}}` | Get all values | `{a:1,b:2}` → `[1,2]` |
| `deepGet` | `{{deepGet obj "nested.property"}}` | Get nested property | Dot notation access |

### Object Manipulation

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `pick` | `{{pick user "name" "id"}}` | Pick specific keys | Returns object with selected keys |
| `omit` | `{{omit user "password"}}` | Omit specific keys | Returns object without selected keys |
| `merge` | `{{merge obj1 obj2}}` | Merge objects | Returns combined object |
| `defaults` | `{{defaults obj defaults}}` | Apply defaults | Merges defaults with object |

### Object Checks

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `isEmpty` | `{{isEmpty value}}` | Check if empty | Works with objects, arrays, strings |
| `isNotEmpty` | `{{isNotEmpty value}}` | Check if not empty | Works with objects, arrays, strings |

---

## 🔀 Logic & Comparison Transformers

### Comparison Operators

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `eq` | `{{eq a b}}` | Equal | `eq 5 5` → `true` |
| `ne` | `{{ne a b}}` | Not equal | `ne 5 3` → `true` |
| `gt` | `{{gt a b}}` | Greater than | `gt 5 3` → `true` |
| `gte` | `{{gte a b}}` | Greater than or equal | `gte 5 5` → `true` |
| `lt` | `{{lt a b}}` | Less than | `lt 3 5` → `true` |
| `lte` | `{{lte a b}}` | Less than or equal | `lte 5 5` → `true` |

**Usage in conditionals:**
```handlebars
{{#if (eq status "active")}}
  Active user
{{/if}}
```

### Logical Operators

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `and` | `{{#and a b}}...{{/and}}` | Logical AND | Both must be truthy |
| `or` | `{{#or a b}}...{{/or}}` | Logical OR | Either must be truthy |

**Usage:**
```handlebars
{{#and isPremium hasAccess}}
  Premium content
{{/and}}
```

---

## ✅ Conditional Transformers

### Conditional Logic

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `ifElse` | `{{ifElse condition "yes" "no"}}` | Ternary operator | Returns first or second value |
| `coalesce` | `{{coalesce value1 value2 value3}}` | First non-null value | Returns first truthy value |
| `default` | `{{default value "fallback"}}` | Default value | Returns value or fallback |

### Value Checks

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `exists` | `{{exists value}}` | Check if not null/undefined | Returns `true` or `false` |
| `isDefined` | `{{isDefined value}}` | Check if defined | Returns `true` or `false` |

### Switch/Case

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `switch` | `{{#switch value}}...{{/switch}}` | Switch statement | Block helper |
| `case` | `{{#case "value"}}...{{/case}}` | Case in switch | Used inside switch |

**Usage:**
```handlebars
{{#switch status}}
  {{#case "active"}}
    ✅ Active
  {{/case}}
  {{#case "pending"}}
    ⏳ Pending
  {{/case}}
{{/switch}}
```

---

## 🧩 Template Transformers

### Partials & Blocks

| Transformer | Syntax | Description | Example |
| :--- | :--- | :--- | :--- |
| `partial` | `{{partial "name" context}}` | Render partial | Programmatic partial rendering |
| `include` | `{{include "name" context}}` | Include template | Explicit context inclusion |
| `block` | `{{#block "name"}}...{{/block}}` | Define named block | Template inheritance |
| `yield` | `{{yield "name"}}` | Render block | Render named block |

**Note:** Handlebars also supports built-in partial syntax: `{{> partialName}}`

---

## Usage Examples

### Combining Transformers

Transformers can be chained in Handlebars expressions:

```handlebars
{{#each users}}
  {{increment @index}}. {{capitalize name}} - {{currency balance}}
{{/each}}
```

### In Conditionals

```handlebars
{{#if (gt (length items) 10)}}
  Large list
{{/if}}
```

### With Arrays

```handlebars
{{#each (sort (filter users "active") "name")}}
  {{capitalize name}}
{{/each}}
```

---

## See Also

- [Main README](../README.md) - Overview and quick start guide
- [Templating Syntax](../README.md#-templating-syntax-handlebars) - Handlebars syntax guide
- [Custom Transformers](../README.md#-advanced-usage) - How to create custom transformers


