import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { OfflineError, complete, stripFences } from './llm';
import { FEATURE_SYSTEM, PLAN_SYSTEM } from './prompts';
import { loadStory, type Story } from '../utils/story';

/** Story -> test plan (plans/) + DRAFT feature file (features/drafts/). Nothing here is executed or applied. */

function existingSteps(): string {
  const dir = 'features/step_definitions';
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
    .join('\n');
}

function offlinePlan(story: Story): string {
  const rows = story.acceptanceCriteria
    .map((ac, i) => `| TC-${String(i + 1).padStart(2, '0')} | ${ac} | TBD | TBD | Yes |`)
    .join('\n');
  return `# Test plan: ${story.key} ${story.title}\n\n_Offline mode: one row per acceptance criterion. Set ANTHROPIC_API_KEY for a full AI-proposed plan._\n\n| ID | Scenario | Type | Priority | Automate? |\n|----|----------|------|----------|-----------|\n${rows}\n`;
}

function offlineFeature(story: Story): string {
  const scenarios = story.acceptanceCriteria
    .map(
      (ac) => `  @ai-draft
  Scenario: ${ac.replace(/"/g, "'").slice(0, 90)}
    # TODO (offline mode): write real steps for: ${ac}
    Given my cart contains "Backpack"
    Then TODO verify this criterion`,
    )
    .join('\n\n');
  return `@${story.key}\nFeature: ${story.title}\n\n  Background:\n    Given I am on the shop home page\n\n${scenarios}\n`;
}

async function main(): Promise<void> {
  const file = process.argv[2] ?? 'stories/PROJ-101.md';
  const story = loadStory(file);
  let plan: string;
  let feature: string;
  let mode = 'ai';

  try {
    plan = await complete({ system: PLAN_SYSTEM, user: `<story>\n${story.raw}\n</story>` });
    feature = stripFences(
      await complete({
        system: FEATURE_SYSTEM,
        user: `Story key: ${story.key}\n<story>\n${story.raw}\n</story>\n<existing_steps>\n${existingSteps()}\n</existing_steps>`,
      }),
    );
    if (!/^\s*(@.*\n)*\s*Feature:/m.test(feature)) throw new Error('Model output did not look like a feature file');
  } catch (err) {
    if (!(err instanceof OfflineError)) throw err;
    mode = 'offline';
    plan = offlinePlan(story);
    feature = offlineFeature(story);
  }

  fs.mkdirSync('plans', { recursive: true });
  fs.mkdirSync('features/drafts', { recursive: true });
  const planFile = `plans/${story.key}.plan.md`;
  const draftFile = `features/drafts/${story.key}.feature`;
  fs.writeFileSync(planFile, plan + '\n');
  fs.writeFileSync(
    draftFile,
    `# AI-PROPOSED DRAFT (${mode}). Not executed until a human approves it:\n# npm run ai:approve -- ${draftFile}\n${feature}\n`,
  );

  console.log(`Plan:  ${planFile}\nDraft: ${draftFile}  (mode: ${mode})\nReview the draft, then approve it with: npm run ai:approve -- ${draftFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
