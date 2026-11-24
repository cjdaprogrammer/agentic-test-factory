import 'dotenv/config';
import * as fs from 'fs';
import { loadReport, scenarioStatus } from '../utils/cucumber-report';

/**
 * Publishes Cucumber results to Zephyr Scale Cloud.
 *  - Scenario tag @PROJ-T101  -> Zephyr test case key
 *  - Feature/scenario tag @PROJ-101 -> Jira issue key (kept for traceability in the output file)
 * Without ZEPHYR_API_TOKEN this is a dry run. Adjust endpoint/fields to your Zephyr setup.
 */
const TEST_CASE_TAG = /^@([A-Z][A-Z0-9]+-T\d+)$/;
const ISSUE_TAG = /^@([A-Z][A-Z0-9]+-\d+)$/;

interface Execution {
  testCaseKey: string;
  issueKeys: string[];
  statusName: 'Pass' | 'Fail' | 'Not Executed';
  scenarios: string[];
}

function collect(): Execution[] {
  const byCase = new Map<string, Execution>();
  for (const feature of loadReport()) {
    for (const el of feature.elements ?? []) {
      const tags = (el.tags ?? []).map((t) => t.name);
      const status = scenarioStatus(el);
      for (const key of tags.map((t) => t.match(TEST_CASE_TAG)?.[1]).filter((k): k is string => Boolean(k))) {
        const entry = byCase.get(key) ?? { testCaseKey: key, issueKeys: [], statusName: 'Pass' as const, scenarios: [] };
        entry.scenarios.push(el.name);
        entry.issueKeys = [...new Set([...entry.issueKeys, ...tags.map((t) => t.match(ISSUE_TAG)?.[1]).filter((k): k is string => Boolean(k))])];
        // Outline examples share one test case: any failure fails it; skipped never overrides a failure.
        if (status === 'failed') entry.statusName = 'Fail';
        else if (status === 'skipped' && entry.statusName === 'Pass') entry.statusName = 'Not Executed';
        byCase.set(key, entry);
      }
    }
  }
  return [...byCase.values()];
}

async function main(): Promise<void> {
  const executions = collect();
  fs.mkdirSync('reports', { recursive: true });
  fs.writeFileSync('reports/zephyr-results.json', JSON.stringify(executions, null, 2));

  const token = process.env.ZEPHYR_API_TOKEN;
  const projectKey = process.env.ZEPHYR_PROJECT_KEY;
  const cycleKey = process.env.ZEPHYR_TEST_CYCLE_KEY;
  const base = process.env.ZEPHYR_BASE_URL ?? 'https://api.zephyrscale.smartbear.com/v2';

  if (!token || !projectKey) {
    console.log('Dry run (ZEPHYR_API_TOKEN / ZEPHYR_PROJECT_KEY not set). Would publish:');
    for (const e of executions) console.log(`  ${e.testCaseKey}: ${e.statusName}  [${e.issueKeys.join(', ')}]`);
    console.log('Saved reports/zephyr-results.json');
    return;
  }

  let failedPublishes = 0;
  for (const e of executions) {
    const res = await fetch(`${base}/testexecutions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        projectKey,
        testCaseKey: e.testCaseKey,
        ...(cycleKey ? { testCycleKey: cycleKey } : {}),
        statusName: e.statusName,
        comment: `Automated run (Cucumber.js). Scenarios: ${e.scenarios.join('; ')}`,
      }),
    });
    if (res.ok) console.log(`Published ${e.testCaseKey}: ${e.statusName}`);
    else {
      failedPublishes++;
      console.error(`Failed ${e.testCaseKey}: ${res.status} ${await res.text()}`);
    }
  }
  if (failedPublishes) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
