import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

/** Human approval gate: moves an AI draft into features/ only after an explicit "y". */
async function main(): Promise<void> {
  const draft = process.argv[2];
  if (!draft || !fs.existsSync(draft)) {
    console.error('Usage: npm run ai:approve -- features/drafts/<KEY>.feature');
    process.exit(1);
  }

  console.log(fs.readFileSync(draft, 'utf8'));
  const rl = readline.createInterface({ input, output });
  const answer = (await rl.question('\nI have reviewed every scenario above. Approve and move to features/? (y/N) ')).trim();
  rl.close();
  if (answer.toLowerCase() !== 'y') {
    console.log('Not approved. Draft left untouched.');
    return;
  }

  const body = fs
    .readFileSync(draft, 'utf8')
    .split('\n')
    .filter((line) => !line.startsWith('# AI-PROPOSED DRAFT') && !line.startsWith('# npm run ai:approve'))
    .join('\n')
    .replace(/@ai-draft/g, '@reviewed')
    .trimStart();

  const target = path.join('features', path.basename(draft));
  const stamp = `# Reviewed by ${os.userInfo().username} on ${new Date().toISOString().slice(0, 10)}\n`;
  fs.writeFileSync(target, stamp + body);
  fs.unlinkSync(draft);
  console.log(`Approved -> ${target}`);
}

main();
