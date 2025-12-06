import { extractVariables } from './dist/index.js';

const template = 'Hello {{name}}, balance: {{currency balance}}, {{#if isPremium}}premium{{/if}} {{#each items}}{{this}}{{/each}}';
const variables = extractVariables(template);
console.log('Current extractVariables:', Array.from(variables).sort());

const template2 = '{{formatDate user.createdAt "YYYY-MM-DD"}}';
const variables2 = extractVariables(template2);
console.log('Current extractVariables (complex):', Array.from(variables2).sort());
