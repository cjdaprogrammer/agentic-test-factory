import 'dotenv/config';
import * as fs from 'fs';
import { OfflineError, complete } from './llm';
import { SUMMARY_SYSTEM } from './prompts';
import { failedScenarios, loadReport } from '../utils/cucumber-report';

async function main(): Promise<void> {
  const failures = failedScenarios(loadReport());
  fs.mkdirSync('reports', { recursive: true });
  const out = 'reports/failure-summary.md';

  if (failures.length === 0) {
    fs.writeFileSync(out, '# Failure summary\n\nNo failing scenarios.\n');
    console.log('No failures. Wrote', out);
    return;
  }

  const raw = failures
    .map(
      (f, i) =>
        `### ${i + 1}. ${f.scenario}\n- Feature: ${f.feature} (${f.uri})\n- Tags: ${f.tags.join(' ') || 'none'}\n- Failing step: ${f.step}\n- Error:\n\`\`\`\n${f.error}\n\`\`\``,
    )
    .join('\n\n');

  let body: string;
  try {
    body = await complete({ system: SUMMARY_SYSTEM, user: `<failures>\n${raw}\n</failures>` });
  } catch (err) {
    if (!(err instanceof OfflineError)) throw err;
    body = `_AI summary skipped (${err.message}). Raw failures:_\n\n${raw}`;
  }

  fs.writeFileSync(out, `# Failure summary\n\n${body}\n`);
  console.log(`Wrote ${out} (${failures.length} failing scenario${failures.length === 1 ? '' : 's'})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
