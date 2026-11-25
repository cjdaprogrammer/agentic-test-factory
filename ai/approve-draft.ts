import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

/**
 * Human approval gate:
 * validates an AI draft before allowing it into features/.
 */

function validateDraft(content: string): string[] {
  const errors: string[] = [];

  if (!content.trim()) {
    errors.push('Draft is empty.');
  }

  if (!/^\s*Feature:/m.test(content)) {
    errors.push('Missing Gherkin Feature declaration.');
  }

  if (!/^\s*Scenario(?: Outline)?:/m.test(content)) {
    errors.push('No Gherkin scenarios found.');
  }

  if (/@ai-draft\b/.test(content)) {
    errors.push('Unreviewed @ai-draft tags remain.');
  }

  if (/\b(?:TODO|TBD)\b/i.test(content)) {
    errors.push('TODO/TBD placeholders must be resolved.');
  }

  return errors;
}

async function main(): Promise<void> {
  const draft = process.argv[2];

  if (!draft || !fs.existsSync(draft)) {
    console.error(
      'Usage: npm run ai:approve -- features/drafts/<KEY>.feature'
    );
    process.exit(1);
  }

  const absoluteDraft = path.resolve(draft);
  const draftDirectory = path.resolve('features/drafts');

  if (
    !absoluteDraft.startsWith(draftDirectory + path.sep) ||
    path.extname(absoluteDraft) !== '.feature'
  ) {
    console.error('Only .feature drafts inside features/drafts/ can be approved.');
    process.exit(1);
  }

  const content = fs.readFileSync(absoluteDraft, 'utf8');

  console.log(content);

  const errors = validateDraft(content);

  if (errors.length > 0) {
    console.error('\nApproval blocked. Resolve these issues first:');

    for (const error of errors) {
      console.error(`- ${error}`);
    }

    process.exit(1);
  }

  const target = path.join('features', path.basename(absoluteDraft));

  if (fs.existsSync(target)) {
    console.error(`Approval blocked: ${target} already exists.`);
    process.exit(1);
  }

  const rl = readline.createInterface({ input, output });

  try {
    const answer = (
      await rl.question(
        '\nI have reviewed every scenario above. Approve and move to features/? (y/N) '
      )
    ).trim();

    if (answer.toLowerCase() !== 'y') {
      console.log('Not approved. Draft left untouched.');
      return;
    }
  } finally {
    rl.close();
  }

  const body = content.trimStart();
  const stamp = `# Reviewed by ${os.userInfo().username} on ${new Date()
    .toISOString()
    .slice(0, 10)}\n`;

  fs.writeFileSync(target, stamp + body);
  fs.unlinkSync(absoluteDraft);

  console.log(`Approved -> ${target}`);
}

main().catch((error) => {
  console.error('Approval failed:', error);
  process.exit(1);
});
