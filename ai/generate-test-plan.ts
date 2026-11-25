
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

import { OfflineError, complete, stripFences } from './llm';
import { FEATURE_SYSTEM, PLAN_SYSTEM } from './prompts';

import { loadStory, type Story } from '../utils/story';
import {
  analyzeCoverage,
  formatCoverage,
  loadExistingScenarios,
  type ExistingScenario,
} from '../utils/feature-coverage';

/**
 * Story -> test plan + human-review draft.
 *
 * Existing feature coverage and step definitions are inspected
 * before generating scenarios.
 *
 * Nothing is executed or automatically approved.
 */

interface TestClassification {
  type: string;
  priority: 'High' | 'Medium' | 'Low';
}

function existingSteps(): string {
  const dir = 'features/step_definitions';

  if (!fs.existsSync(dir)) {
    return 'No step definitions found.';
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.ts'))
    .sort()
    .map((file) => fs.readFileSync(path.join(dir, file), 'utf8'))
    .join('\n');
}

function scenarioContext(scenarios: ExistingScenario[]): string {
  if (scenarios.length === 0) {
    return 'No existing feature scenarios were found.';
  }

  return scenarios
    .map((scenario) =>
      [
        `File: ${scenario.file}`,
        `Scenario: ${scenario.name}`,
        `Tags: ${scenario.tags.join(', ') || 'none'}`,
        'Steps:',
        ...scenario.steps.map((step) => `  ${step}`),
      ].join('\n'),
    )
    .join('\n\n');
}

/**
 * Offline heuristic classification.
 * These values are suggestions and require human review.
 */
function classifyCriterion(criterion: string): TestClassification {
  const text = criterion.toLowerCase();

  // Negative paths take precedence over other classifications.
  if (
    /empty cart|invalid|expired|not allowed|reject|unchanged/.test(text)
  ) {
    return {
      type: 'Negative',
      priority: 'High',
    };
  }

  // Business rules and minimum-value boundaries.
  if (
    /below the minimum|minimum|at least|only one|at a time|one code/.test(
      text,
    )
  ) {
    return {
      type: 'Boundary / Business Rule',
      priority: 'High',
    };
  }

  // State changes, such as removing an applied discount.
  if (/remove|removing/.test(text)) {
    return {
      type: 'Functional / State Change',
      priority: 'Medium',
    };
  }

  // Calculations and percentage-based behavior.
  if (/reduce|percentage|takes \$|order total/.test(text)) {
    return {
      type: 'Functional / Calculation',
      priority: 'High',
    };
  }

  // General functional behavior.
  if (/case sensitive|discount/.test(text)) {
    return {
      type: 'Functional',
      priority: 'Medium',
    };
  }

  return {
    type: 'Functional',
    priority: 'Medium',
  };
}

function offlinePlan(
  story: Story,
  coverageReport: string,
): string {
  const rows = story.acceptanceCriteria
    .map((criterion, index) => {
      const classification = classifyCriterion(criterion);
      const id = `TC-${String(index + 1).padStart(2, '0')}`;

      return [
        `| ${id}`,
        criterion.replace(/\|/g, '\\|'),
        classification.type,
        classification.priority,
        'Yes |',
      ].join(' | ');
    })
    .join('\n');

  return [
    `# Test plan: ${story.key} ${story.title}`,
    '',
    '_Offline mode: classifications are heuristic suggestions and require human review. Set ANTHROPIC_API_KEY for a full AI-proposed plan._',
    '',
    '| ID | Scenario | Type | Priority | Automate? |',
    '|----|----------|------|----------|-----------|',
    rows,
    '',
    '## Existing coverage review',
    '',
    coverageReport,
    '',
    '_Coverage signals are preliminary. A traceability tag does not independently prove that the scenario verifies the full business requirement._',
    '',
    '_Type and priority are assigned using keyword-based heuristics and require human review._',
    '',
  ].join('\n');
}

function offlineFeature(
  story: Story,
  coverage: ReturnType<typeof analyzeCoverage>,
): string {
  const missing = coverage.filter(
    (item) => item.status === 'MISSING',
  );

  const scenarios = missing.map((item) =>
    [
      `  @ai-draft @${item.id}`,
      `  Scenario: ${item.criterion.replace(/"/g, "'").slice(0, 90)}`,
      '    # TODO (offline mode): define meaningful steps and expected assertions.',
      `    # Acceptance criterion: ${item.criterion}`,
    ].join('\n'),
  );

  const reviewComments = coverage
    .filter((item) => item.status !== 'MISSING')
    .map(
      (item) =>
        `# ${item.id}: ${item.status} — no duplicate scenario generated.`,
    );

  return [
    `@${story.key}`,
    `Feature: ${story.title}`,
    '',
    '# Existing scenarios were inspected before generating this draft.',
    ...reviewComments,
    '',
    ...(scenarios.length > 0
      ? scenarios
      : ['# No missing criteria identified by the offline analyzer.']),
    '',
  ].join('\n');
}

async function generatePlan(
  story: Story,
  existingContext: string,
  coverageReport: string,
): Promise<{ content: string; mode: 'ai' | 'offline' }> {
  try {
    const content = await complete({
      system: PLAN_SYSTEM,
      user: [
        `<story>\n${story.raw}\n</story>`,
        `<existing_scenarios>\n${existingContext}\n</existing_scenarios>`,
        `<coverage_review>\n${coverageReport}\n</coverage_review>`,
      ].join('\n\n'),
    });

    return {
      content: content.trim(),
      mode: 'ai',
    };
  } catch (error) {
    if (!(error instanceof OfflineError)) {
      throw error;
    }

    return {
      content: offlinePlan(story, coverageReport),
      mode: 'offline',
    };
  }
}

async function generateFeature(
  story: Story,
  stepsContext: string,
  existingContext: string,
  coverageReport: string,
  coverage: ReturnType<typeof analyzeCoverage>,
): Promise<{ content: string; mode: 'ai' | 'offline' }> {
  try {
    const content = stripFences(
      await complete({
        system: FEATURE_SYSTEM,
        user: [
          `Story key: ${story.key}`,
          `<story>\n${story.raw}\n</story>`,
          `<existing_steps>\n${stepsContext}\n</existing_steps>`,
          `<existing_scenarios>\n${existingContext}\n</existing_scenarios>`,
          `<coverage_review>\n${coverageReport}\n</coverage_review>`,
        ].join('\n\n'),
      }),
    ).trim();

    if (!/^\s*(@[^\r\n]+\s*\r?\n)*\s*Feature:/m.test(content)) {
      throw new Error(
        'Model output did not look like a valid Gherkin feature file.',
      );
    }

    return {
      content,
      mode: 'ai',
    };
  } catch (error) {
    if (!(error instanceof OfflineError)) {
      throw error;
    }

    return {
      content: offlineFeature(story, coverage),
      mode: 'offline',
    };
  }
}

async function main(): Promise<void> {
  const storyFile = process.argv[2] ?? 'stories/PROJ-101.md';
  const story = loadStory(storyFile);

  const planFile = path.join(
    'plans',
    `${story.key}.plan.md`,
  );

  const draftFile = path.join(
    'features',
    'drafts',
    `${story.key}.feature`,
  );

  // Never silently overwrite an earlier human-review draft.
  if (fs.existsSync(draftFile)) {
    throw new Error(
      `Draft already exists: ${draftFile}\n` +
        'Review or rename the existing draft before generating another one.',
    );
  }

  const existingScenarios = loadExistingScenarios('features');

  const coverage = analyzeCoverage(
    story.acceptanceCriteria,
    existingScenarios,
  );

  const coverageReport = formatCoverage(coverage);
  const existingContext = scenarioContext(existingScenarios);
  const stepsContext = existingSteps();

  const [planResult, featureResult] = await Promise.all([
    generatePlan(story, existingContext, coverageReport),
    generateFeature(
      story,
      stepsContext,
      existingContext,
      coverageReport,
      coverage,
    ),
  ]);

  const plan = planResult.content;
  const feature = featureResult.content;

  const mode =
    planResult.mode === 'ai' && featureResult.mode === 'ai'
      ? 'ai'
      : 'offline';

  fs.mkdirSync('plans', { recursive: true });
  fs.mkdirSync('features/drafts', { recursive: true });

  // Write the plan and draft only after both generation tasks succeed.
  fs.writeFileSync(planFile, `${plan.trim()}\n`, 'utf8');

  fs.writeFileSync(
    draftFile,
    [
      `# AI-PROPOSED DRAFT (${mode}). Not executed until a human approves it:`,
      `# npm run ai:approve -- ${draftFile}`,
      feature.trim(),
      '',
    ].join('\n'),
    'utf8',
  );

  const taggedCount = coverage.filter(
    (item) => item.status === 'TAGGED',
  ).length;

  const reviewCount = coverage.filter(
    (item) => item.status === 'REVIEW',
  ).length;

  const missingCount = coverage.filter(
    (item) => item.status === 'MISSING',
  ).length;

  console.log(
    [
      `Plan:  ${planFile} (mode: ${planResult.mode})`,
      `Draft: ${draftFile} (mode: ${featureResult.mode})`,
      `Existing scenarios inspected: ${existingScenarios.length}`,
      `Tagged criteria: ${taggedCount}`,
      `Possible matches requiring review: ${reviewCount}`,
      `Criteria with no match: ${missingCount}`,
      'Review the draft before considering approval.',
    ].join('\n'),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
