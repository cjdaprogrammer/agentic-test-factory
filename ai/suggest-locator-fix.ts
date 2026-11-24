import 'dotenv/config';
import * as fs from 'fs';
import { OfflineError, complete } from './llm';
import { LOCATOR_SYSTEM } from './prompts';
import { failedScenarios, loadReport } from '../utils/cucumber-report';
import { slugify } from '../utils/slug';

/** Suggestions only: writes reports/locator-fix-suggestions.md and never edits page objects. */
async function main(): Promise<void> {
  const candidates = failedScenarios(loadReport())
    .filter((f) => /locator|strict mode|waiting for|timeout/i.test(f.error))
    .slice(0, 5);

  fs.mkdirSync('reports', { recursive: true });
  const out = 'reports/locator-fix-suggestions.md';

  if (candidates.length === 0) {
    fs.writeFileSync(out, '# Locator-fix suggestions\n\nNo locator-style failures found.\n');
    console.log('No locator-style failures. Wrote', out);
    return;
  }

  const pageObjects = fs
    .readdirSync('pages')
    .filter((f) => f.endsWith('.ts'))
    .map((f) => `// pages/${f}\n${fs.readFileSync(`pages/${f}`, 'utf8')}`)
    .join('\n\n');

  const sections: string[] = [];
  for (const f of candidates) {
    const domFile = `reports/dom/${slugify(f.scenario)}.html`;
    const dom = fs.existsSync(domFile) ? fs.readFileSync(domFile, 'utf8').slice(0, 20_000) : '(no DOM snapshot captured)';
    let body: string;
    try {
      body = await complete({
        system: LOCATOR_SYSTEM,
        user: `Scenario: ${f.scenario}\nStep: ${f.step}\nError:\n${f.error}\n<dom>\n${dom}\n</dom>\n<code>\n${pageObjects}\n</code>`,
      });
    } catch (err) {
      if (!(err instanceof OfflineError)) throw err;
      body = `_AI suggestion skipped (${err.message})._`;
    }
    sections.push(`## ${f.scenario}\n\n${body}`);
  }

  fs.writeFileSync(out, `# Locator-fix suggestions (review before applying)\n\n${sections.join('\n\n')}\n`);
  console.log(`Wrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
