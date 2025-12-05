# Security Policy

## Supported Versions

We actively support the following versions of Prompt Weaver with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do NOT** open a public issue

Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Report the vulnerability

please contact our admins in telegram @IQAICOM

Include the following information in your report:

- **Type of vulnerability** (e.g., XSS, injection, etc.)
- **Affected component** (e.g., template rendering, validation, etc.)
- **Steps to reproduce** the vulnerability
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### 3. Response timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)

### 4. Severity Levels

We use the following severity levels:

- **Critical**: Remote code execution, authentication bypass, data exposure
  - **Response**: Immediate (within 24 hours)
  - **Fix**: As soon as possible (typically within 7 days)

- **High**: Privilege escalation, significant data leakage
  - **Response**: Within 48 hours
  - **Fix**: Within 14 days

- **Medium**: Information disclosure, denial of service
  - **Response**: Within 7 days
  - **Fix**: Within 30 days

- **Low**: Minor information disclosure, best practice violations
  - **Response**: Within 14 days
  - **Fix**: Next regular release

### 5. Disclosure Policy

- We will acknowledge receipt of your report within 48 hours
- We will keep you informed of the progress toward resolving the issue
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

### 6. What to expect

- **Confirmation**: You'll receive confirmation that we've received your report
- **Updates**: Regular updates on the status of the vulnerability
- **Credit**: Recognition for responsible disclosure (if desired)
- **Fix**: A patch addressing the vulnerability

## Security Best Practices

When using Prompt Weaver, please follow these security best practices:

### Template Security

- **Never** render user-provided templates without validation
- **Sanitize** user input before passing it to templates
- **Validate** template variables before rendering
- **Use** the built-in validation utilities

### Data Validation

- Always validate data before rendering templates
- Use TypeScript types for type safety
- Enable `strict` mode for extra validation
- Use `throwOnMissing` option in production

### Example Safe Usage

```typescript
import { PromptWeaver } from "@iqai/prompt-weaver";

// ✅ Good: Validate and sanitize user input
const userInput = sanitizeUserInput(rawUserInput);
const weaver = new PromptWeaver(template, {
  strict: true,
  throwOnMissing: true,
});

// ✅ Good: Validate data before rendering
const validation = weaver.validate(userInput);
if (!validation.valid) {
  throw new Error("Invalid data");
}

const output = weaver.format(userInput);
```

### Example Unsafe Usage

```typescript
// ❌ Bad: Rendering untrusted user input directly
const weaver = new PromptWeaver(userProvidedTemplate);
const output = weaver.format(unvalidatedUserData);
```

## Known Security Considerations

### Template Injection

Prompt Weaver uses Handlebars for template rendering. While Handlebars is designed to prevent code execution, you should:

- Never render templates from untrusted sources
- Validate all template variables
- Use the built-in validation features

### XSS Prevention

When rendering templates that will be displayed in HTML:

- Always escape HTML content appropriately
- Use proper sanitization libraries for HTML output
- Never trust user-provided template content

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 0.1.1 → 0.1.2)
- Documented in the CHANGELOG.md
- Announced via GitHub security advisories (if applicable)

## Questions?

If you have questions about security, please:

- Review this security policy
- Check existing security advisories
- Contact the maintainers privately

Thank you for helping keep Prompt Weaver secure! 🔒

