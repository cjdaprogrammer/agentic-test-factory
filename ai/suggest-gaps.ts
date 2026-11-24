import 'dotenv/config';
import * as fs from 'fs';
import { OfflineError, complete } from './llm';
import { GAPS_SYSTEM } from './prompts';
import { loadStory, type Story } from '../utils/story';

const STOP = new Set(['only', 'code', 'codes', 'order', 'applied', 'apply', 'shopper', 'with', 'that', 'when', 'from', 'their', 'this', 'there', 'cart']);

/** Very rough keyword check, used only when no API key is available. */
function offlineGaps(story: Story, featureText: string): string {
  const text = featureText.toLowerCase();
  const rows = story.acceptanceCriteria.map((ac) => {
    const tokens = (ac.toLowerCase().match(/[a-z0-9$%]{4,}/g) ?? []).filter((t) => !STOP.has(t));
    const hits = tokens.filter((t) => text.includes(t)).length;
    const covered = tokens.length === 0 || hits / tokens.length >= 0.5;
    return `| ${ac} | ${covered ? 'Probably covered' : 'POSSIBLE GAP'} |`;
  });
  return `_Offline keyword heuristic. Set ANTHROPIC_API_KEY for a real review._\n\n| Acceptance criterion | Status |\n|---|---|\n${rows.join('\n')}\n`;
}

async function main(): Promise<void> {
  const storyFile = process.argv[2] ?? 'stories/PROJ-101.md';
  const story = loadStory(storyFile);
  const featureText = fs
    .readdirSync('features')
    .filter((f) => f.endsWith('.feature'))
    .map((f) => `# ${f}\n${fs.readFileSync(`features/${f}`, 'utf8')}`)
    .join('\n\n');

  let body: string;
  try {
    body = await complete({ system: GAPS_SYSTEM, user: `<story>\n${story.raw}\n</story>\n<code>\n${featureText}\n</code>` });
  } catch (err) {
    if (!(err instanceof OfflineError)) throw err;
    body = offlineGaps(story, featureText);
  }

  fs.mkdirSync('plans', { recursive: true });
  const out = `plans/${story.key}.gaps.md`;
  fs.writeFileSync(out, `# Test-gap review: ${story.key}\n\n${body}\n`);
  console.log(`Wrote ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
