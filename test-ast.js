import Handlebars from 'handlebars';

const template = 'Hello {{name}}, balance: {{currency balance}}, {{#if isPremium}}premium{{/if}} {{#each items}}{{this}}{{/each}}';
const ast = Handlebars.parse(template);

const BUILT_IN_HELPERS = new Set(['if', 'unless', 'each', 'with', 'lookup', 'log']);
const visitor = new Handlebars.Visitor();
const variables = new Set();

visitor.MustacheStatement = function(mustache) {
  if (mustache.path && mustache.path.type === 'PathExpression' && mustache.path.parts) {
    const varName = mustache.path.parts[0];
    if (varName && !varName.startsWith('@') && varName !== 'this') {
      variables.add(varName);
    }
  }
  // Visit params for helpers (e.g., {{currency balance}})
  if (mustache.params) {
    for (const param of mustache.params) {
      if (param.type === 'PathExpression' && param.parts) {
        const varName = param.parts[0];
        if (varName && !varName.startsWith('@') && varName !== 'this') {
          variables.add(varName);
        }
      }
    }
  }
  Handlebars.Visitor.prototype.MustacheStatement.call(this, mustache);
};

visitor.BlockStatement = function(block) {
  // For block helpers, check params but not the helper name itself
  if (block.params) {
    for (const param of block.params) {
      if (param.type === 'PathExpression' && param.parts) {
        const varName = param.parts[0];
        if (varName && !varName.startsWith('@') && varName !== 'this') {
          variables.add(varName);
        }
      }
    }
  }
  Handlebars.Visitor.prototype.BlockStatement.call(this, block);
};

visitor.accept(ast);
console.log('Variables found:', Array.from(variables));
console.log('Expected: name, balance, isPremium, items');
