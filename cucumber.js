// Cucumber.js profile. Only features/*.feature run; AI drafts in features/drafts/ are never executed.
const common = {
  requireModule: ['ts-node/register'],
  require: ['features/support/**/*.ts', 'features/step_definitions/**/*.ts'],
  paths: ['features/*.feature'],
  format: [
    'summary',
    'json:reports/cucumber.json',
    'html:reports/cucumber.html',
  ],
  formatOptions: { snippetInterface: 'async-await' },
};

module.exports = { default: common };
