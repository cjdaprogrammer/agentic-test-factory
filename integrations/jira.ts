import 'dotenv/config';
import * as fs from 'fs';

type Adf = { type: string; text?: string; content?: Adf[]; attrs?: { level?: number } };

function children(node: Adf): string {
  return (node.content ?? []).map(adfToText).join('');
}

/** Minimal Atlassian Document Format -> Markdown converter (headings, paragraphs, lists). */
function adfToText(node: Adf): string {
  switch (node.type) {
    case 'text':
      return node.text ?? '';
    case 'hardBreak':
      return '\n';
    case 'heading':
      return `${'#'.repeat(node.attrs?.level ?? 2)} ${children(node)}\n\n`;
    case 'paragraph':
      return `${children(node)}\n\n`;
    case 'bulletList':
    case 'orderedList':
      return `${children(node)}\n`;
    case 'listItem':
      return `- ${children(node).trim()}\n`;
    default:
      return children(node);
  }
}

/** Usage: npm run story:fetch -- PROJ-101  ->  stories/PROJ-101.md */
async function main(): Promise<void> {
  const key = process.argv[2];
  const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
  if (!key) throw new Error('Usage: npm run story:fetch -- PROJ-101');
  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error('Set JIRA_BASE_URL, JIRA_EMAIL and JIRA_API_TOKEN in .env (or use the sample stories/PROJ-101.md).');
  }

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  const res = await fetch(
    `${JIRA_BASE_URL}/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,description,issuetype`,
    { headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' } },
  );
  if (!res.ok) throw new Error(`Jira responded ${res.status}: ${await res.text()}`);

  const issue = (await res.json()) as {
    fields: { summary: string; issuetype?: { name: string }; description?: Adf | null };
  };
  const description = issue.fields.description ? adfToText(issue.fields.description).trim() : '';
  const md = `# ${key}: ${issue.fields.summary}\n\n**Type:** ${issue.fields.issuetype?.name ?? 'Story'}\n\n## Description\n${description}\n`;

  fs.mkdirSync('stories', { recursive: true });
  fs.writeFileSync(`stories/${key}.md`, md);
  console.log(`Wrote stories/${key}.md`);
  console.log('Tip: make sure it has an "## Acceptance Criteria" bullet list so ai:plan can use it.');
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
