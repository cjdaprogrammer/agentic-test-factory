
import * as fs from 'fs';
import { loadStory } from '../utils/story';
import {
  loadReport,
  scenarioStatus,
  type CucumberElement,
  type CucumberStep,
} from '../utils/cucumber-report';

const TEST_CASE_TAG = /^@(ATF-T\d+)$/;

type StepStatus = 'passed' | 'failed' | 'skipped';

interface AssertionEvidence {
  category: string;
  step: string;
  status: StepStatus;
}

interface ScenarioCoverage {
  name: string;
  status: StepStatus;
  testCases: string[];
  assertions: AssertionEvidence[];
}

interface CriterionCoverage {
  id: string;
  description: string;
  scenarios: ScenarioCoverage[];
  testCases: string[];
  status: 'Verified' | 'Failed' | 'Partial' | 'Not Executed' | 'Missing';
  assertionCounts: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };
}

function escapeMarkdown(value: string): string {
  return value
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function getTags(element: CucumberElement): string[] {
  return (element.tags ?? []).map((tag) => tag.name);
}

/**
 * Recognizes only the assertion steps implemented in discount.steps.ts.
 * Setup and action steps are deliberately excluded.
 */
function classifyAssertion(step: CucumberStep): string | null {
  const name = step.name ?? '';

  if (/^I should see the message /.test(name)) {
    return 'Message';
  }

  if (/^the subtotal should be /.test(name)) {
    return 'Subtotal';
  }

  if (/^the discount should be /.test(name)) {
    return 'Discount';
  }

  if (/^no discount should be applied$/.test(name)) {
    return 'Zero-discount';
  }

  if (/^the order total should be /.test(name)) {
    return 'Order total';
  }

  return null;
}

function getAssertionStatus(step: CucumberStep): StepStatus {
  const status = step.result.status;

  if (status === 'passed') return 'passed';

  if (
    status === 'failed' ||
    status === 'ambiguous' ||
    status === 'undefined' ||
    status === 'pending'
  ) {
    return 'failed';
  }

  return 'skipped';
}

function collectAssertions(
  steps: CucumberStep[],
): AssertionEvidence[] {
  return steps.flatMap((step) => {
    const category = classifyAssertion(step);

    if (!category) return [];

    return [{
      category,
      step: step.name ?? '(unnamed step)',
      status: getAssertionStatus(step),
    }];
  });
}

function buildCoverage(
  criteria: string[],
  elements: CucumberElement[],
): CriterionCoverage[] {
  return criteria.map((description, index) => {
    const id = `TC-${String(index + 1).padStart(2, '0')}`;
    const expectedTag = `@AC-TC${String(index + 1).padStart(2, '0')}`;

    const scenarios = elements
      .filter((element) => getTags(element).includes(expectedTag))
      .map((element): ScenarioCoverage => {
        const tags = getTags(element);
        const steps = element.steps ?? [];

        return {
          name: element.name,
          status: scenarioStatus(element),
          testCases: tags
            .map((tag) => tag.match(TEST_CASE_TAG)?.[1])
            .filter((key): key is string => Boolean(key)),
          assertions: collectAssertions(steps),
        };
      });

    const statuses = scenarios.map((scenario) => scenario.status);

    let status: CriterionCoverage['status'];

    if (scenarios.length === 0) {
      status = 'Missing';
    } else if (statuses.includes('failed')) {
      status = 'Failed';
    } else if (statuses.every((value) => value === 'passed')) {
      status = 'Verified';
    } else if (statuses.some((value) => value === 'passed')) {
      status = 'Partial';
    } else {
      status = 'Not Executed';
    }

    const assertions = scenarios.flatMap(
      (scenario) => scenario.assertions,
    );

    const assertionCounts = {
      total: assertions.length,
      passed: assertions.filter((a) => a.status === 'passed').length,
      failed: assertions.filter((a) => a.status === 'failed').length,
      skipped: assertions.filter((a) => a.status === 'skipped').length,
    };

    const testCases = [
      ...new Set(scenarios.flatMap((scenario) => scenario.testCases)),
    ].sort();

    return {
      id,
      description,
      scenarios,
      testCases,
      status,
      assertionCounts,
    };
  });
}

function renderReport(
  storyKey: string,
  coverage: CriterionCoverage[],
): string {
  const counts = {
    Verified: 0,
    Failed: 0,
    Partial: 0,
    'Not Executed': 0,
    Missing: 0,
  };

  for (const item of coverage) {
    counts[item.status]++;
  }

  const totals = coverage.reduce(
    (result, item) => ({
      total: result.total + item.assertionCounts.total,
      passed: result.passed + item.assertionCounts.passed,
      failed: result.failed + item.assertionCounts.failed,
      skipped: result.skipped + item.assertionCounts.skipped,
    }),
    { total: 0, passed: 0, failed: 0, skipped: 0 },
  );

  const rows = coverage.map((item) => {
    const scenarios = item.scenarios.length
      ? item.scenarios
          .map((scenario) => {
            return `${escapeMarkdown(scenario.name)} (${scenario.status.toUpperCase()})`;
          })
          .join('<br>')
      : '—';

    const assertionSummary =
      `${item.assertionCounts.passed}/${item.assertionCounts.total} passed`;

    return `| ${item.id} | ${escapeMarkdown(item.description)} | ${scenarios} | ${item.testCases.join(', ') || '—'} | ${assertionSummary} | ${item.status} |`;
  });

  const evidenceRows = coverage.flatMap((item) => {
    return item.scenarios.flatMap((scenario) => {
      if (scenario.assertions.length === 0) {
        return [
          `| ${item.id} | ${escapeMarkdown(scenario.name)} | — | No recognized assertions |`,
        ];
      }

      return scenario.assertions.map((assertion) => {
        return `| ${item.id} | ${escapeMarkdown(scenario.name)} | ${assertion.category} | ${escapeMarkdown(assertion.step)} (${assertion.status.toUpperCase()}) |`;
      });
    });
  });

  const total = coverage.length;
  const verifiedPercentage = total
    ? ((counts.Verified / total) * 100).toFixed(1)
    : '0.0';

  return [
    `# Requirements Traceability: ${storyKey}`,
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Coverage summary',
    '',
    `- Total acceptance criteria: ${total}`,
    `- Verified: ${counts.Verified}`,
    `- Failed: ${counts.Failed}`,
    `- Partial: ${counts.Partial}`,
    `- Not executed: ${counts['Not Executed']}`,
    `- Missing: ${counts.Missing}`,
    `- Tagged acceptance-criterion coverage: ${verifiedPercentage}%`,
    '',
    '## Assertion execution summary',
    '',
    `- Recognized assertions: ${totals.total}`,
    `- Passed assertions: ${totals.passed}`,
    `- Failed assertions: ${totals.failed}`,
    `- Skipped assertions: ${totals.skipped}`,
    '',
    '## Acceptance criterion traceability',
    '',
    '| ID | Acceptance criterion | BDD scenarios and results | Zephyr test cases | Assertion results | Coverage status |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
    '## Assertion evidence',
    '',
    '| Criterion | BDD scenario | Assertion category | Executed Gherkin assertion |',
    '|---|---|---|---|',
    ...evidenceRows,
    '',
    '## Status definitions',
    '',
    '- **Verified:** At least one mapped scenario exists and all mapped scenarios passed.',
    '- **Failed:** At least one mapped scenario failed.',
    '- **Partial:** Some mapped scenarios passed while others were skipped or undefined.',
    '- **Not Executed:** Mapped scenarios exist, but none passed or failed.',
    '- **Missing:** No scenario has the corresponding acceptance-criterion tag.',
    '',
    '## Assertion classification',
    '',
    '- Message: confirmation or rejection message checks.',
    '- Subtotal: subtotal text checks.',
    '- Discount: discount amount checks.',
    '- Zero-discount: checks that the discount is `$0.00`.',
    '- Order total: final total text checks.',
    '- Only the five known assertion step patterns are counted.',
    '- Background, setup, and action steps are excluded.',
    '',
    '## Traceability limitations',
    '',
    '- Acceptance-criterion mappings depend on manually maintained `@AC-TCxx` tags.',
    '- Assertion evidence is extracted from the latest generated Cucumber JSON report.',
    '- Recognized passing steps demonstrate that the corresponding Playwright assertions completed successfully.',
    '- This report does not independently prove complete business-rule coverage or query the latest remote Zephyr execution status.',
    '- Review failed, skipped, and missing criteria before treating the story as fully tested.',
    '',
  ].join('\n');
}

function main(): void {
  const storyFile = process.argv[2] ?? 'stories/PROJ-101.md';
  const story = loadStory(storyFile);
  const features = loadReport();

  const elements = features.flatMap(
    (feature) => feature.elements ?? [],
  );

  const coverage = buildCoverage(
    story.acceptanceCriteria,
    elements,
  );

  const report = renderReport(story.key, coverage);

  fs.mkdirSync('reports', { recursive: true });

  const output = `reports/${story.key}-traceability.md`;

  fs.writeFileSync(output, report, 'utf8');

  console.log(`Generated ${output}`);
  console.log(`Acceptance criteria: ${coverage.length}`);

  for (const item of coverage) {
    console.log(
      `${item.id}: ${item.status} | Assertions: ${item.assertionCounts.passed}/${item.assertionCounts.total} | Zephyr: ${item.testCases.join(', ') || 'No mapping'}`,
    );
  }
}

main();
