import * as fs from 'fs';

export interface CucumberStep {
  keyword: string;
  name?: string;
  hidden?: boolean;
  result: { status: string; error_message?: string; duration?: number };
}
export interface CucumberElement {
  name: string;
  tags?: { name: string }[];
  steps?: CucumberStep[];
}
export interface CucumberFeature {
  name: string;
  uri: string;
  elements?: CucumberElement[];
}
export type ScenarioStatus = 'passed' | 'failed' | 'skipped';

const FAILING = ['failed', 'ambiguous', 'undefined', 'pending'];

export function loadReport(file = 'reports/cucumber.json'): CucumberFeature[] {
  if (!fs.existsSync(file)) throw new Error(`${file} not found. Run "npm run test:bdd" first.`);
  return JSON.parse(fs.readFileSync(file, 'utf8')) as CucumberFeature[];
}

export function scenarioStatus(el: CucumberElement): ScenarioStatus {
  const statuses = (el.steps ?? []).map((s) => s.result.status);
  if (statuses.some((s) => FAILING.includes(s))) return 'failed';
  if (statuses.length > 0 && statuses.every((s) => s === 'passed')) return 'passed';
  return 'skipped';
}

export interface FailedScenario {
  feature: string;
  uri: string;
  scenario: string;
  tags: string[];
  step: string;
  error: string;
}

export function failedScenarios(features: CucumberFeature[]): FailedScenario[] {
  const out: FailedScenario[] = [];
  for (const feature of features) {
    for (const el of feature.elements ?? []) {
      if (scenarioStatus(el) !== 'failed') continue;
      const bad = (el.steps ?? []).find((s) => FAILING.includes(s.result.status));
      out.push({
        feature: feature.name,
        uri: feature.uri,
        scenario: el.name,
        tags: (el.tags ?? []).map((t) => t.name),
        step: bad ? `${bad.keyword.trim()} ${bad.name ?? ''}`.trim() : '',
        error: (bad?.result.error_message ?? bad?.result.status ?? 'unknown').slice(0, 1500),
      });
    }
  }
  return out;
}
