// Cucumber.js profiles.
// Only features/*.feature run; AI drafts in features/drafts/ are never executed.

const common = {
  requireModule: ['ts-node/register'],
  require: [
    'features/support/**/*.ts',
    'features/step_definitions/**/*.ts',
  ],
  paths: ['features/*.feature'],
  format: [
    'summary',
    'json:reports/cucumber.json',
    'html:reports/cucumber.html',
  ],
  formatOptions: {
    snippetInterface: 'async-await',
  },
};

const smoke = {
  ...common,
  tags: '@smoke',
  format: [
    'summary',
    'json:reports/cucumber-smoke.json',
    'html:reports/cucumber-smoke.html',
  ],
};

module.exports = {
  default: common,
  smoke,
};
