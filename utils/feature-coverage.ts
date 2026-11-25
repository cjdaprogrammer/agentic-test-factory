
import * as fs from 'fs';
import * as path from 'path';

export interface ExistingScenario {
  file: string;
  name: string;
  tags: string[];
  steps: string[];
}

export interface CriterionCoverage {
  id: string;
  criterion: string;
  matchingScenarios: ExistingScenario[];
  status: 'TAGGED' | 'REVIEW' | 'MISSING';
}

function findFeatureFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Never treat unapproved AI drafts as existing coverage.
      if (entry.name === 'drafts') return [];
      return findFeatureFiles(fullPath);
    }

    return entry.isFile() && entry.name.endsWith('.feature')
      ? [fullPath]
      : [];
  });
}

function parseFeatureFile(file: string): ExistingScenario[] {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const scenarios: ExistingScenario[] = [];

  let pendingTags: string[] = [];
  let current: ExistingScenario | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (/^Feature:/i.test(line)) {
      pendingTags = [];
      continue;
    }

    if (line.startsWith('@')) {
      const tags = line.match(/@[A-Za-z0-9_-]+/g) ?? [];
      const nextLine = lines[i + 1]?.trim() ?? '';

      // Tags immediately above Examples belong to the current
      // Scenario Outline, such as separate invalid/expired examples.
      if (current && /^Examples:/i.test(nextLine)) {
        current.tags.push(...tags);
      } else {
        pendingTags.push(...tags);
      }
      continue;
    }

    const scenarioMatch = line.match(
      /^Scenario(?: Outline)?:\s*(.+)$/i,
    );

    if (scenarioMatch) {
      current = {
        file: path.relative(process.cwd(), file).replace(/\\/g, '/'),
        name: scenarioMatch[1].trim(),
        tags: [...new Set(pendingTags)],
        steps: [],
      };

      scenarios.push(current);
      pendingTags = [];
      continue;
    }

    if (!current) continue;

    if (/^(Given|When|Then|And|But)\s+/i.test(line)) {
      current.steps.push(line);
    }
  }

  return scenarios;
}

function normalizeTokens(value: string): string[] {
  const stopWords = new Set([
    'only', 'code', 'codes', 'order', 'applied', 'apply',
    'shopper', 'with', 'that', 'when', 'from', 'their',
    'this', 'there', 'cart', 'should', 'must', 'can',
  ]);

  return (value.toLowerCase().match(/[a-z0-9$%]{4,}/g) ?? [])
    .filter((token) => !stopWords.has(token));
}

export function loadExistingScenarios(
  featureDir = 'features',
): ExistingScenario[] {
  return findFeatureFiles(featureDir).flatMap(parseFeatureFile);
}

export function analyzeCoverage(
  acceptanceCriteria: string[],
  scenarios: ExistingScenario[],
): CriterionCoverage[] {
  return acceptanceCriteria.map((criterion, index) => {
    const id = `AC-TC${String(index + 1).padStart(2, '0')}`;
    const tagged = scenarios.filter((scenario) =>
      scenario.tags.includes(`@${id}`),
    );

    if (tagged.length > 0) {
      return {
        id,
        criterion,
        matchingScenarios: tagged,
        status: 'TAGGED',
      };
    }

    const criterionTokens = normalizeTokens(criterion);

    const possibleMatches = scenarios.filter((scenario) => {
      const scenarioText = [
        scenario.name,
        ...scenario.steps,
      ].join(' ');

      const scenarioTokens = new Set(normalizeTokens(scenarioText));
      const hits = criterionTokens.filter((token) =>
        scenarioTokens.has(token),
      ).length;

      return hits >= 2;
    });

    return {
      id,
      criterion,
      matchingScenarios: possibleMatches,
      status: possibleMatches.length > 0 ? 'REVIEW' : 'MISSING',
    };
  });
}

export function formatCoverage(coverage: CriterionCoverage[]): string {
  const rows = coverage.map((item) => {
    const matches = item.matchingScenarios.length
      ? item.matchingScenarios
          .map((scenario) => `${scenario.name} (${scenario.file})`)
          .join('; ')
      : '—';

    const status =
      item.status === 'TAGGED'
        ? 'TAGGED — existing traceability tag'
        : item.status === 'REVIEW'
          ? 'POSSIBLE MATCH — manual review required'
          : 'NO MATCH FOUND';

    return `| ${item.id} | ${item.criterion} | ${status} | ${matches} |`;
  });

  return [
    '| Criterion | Acceptance criterion | Coverage signal | Existing scenarios |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n');
}
