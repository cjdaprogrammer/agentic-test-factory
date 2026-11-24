import * as fs from 'fs';
import * as path from 'path';

export interface Story {
  key: string;
  title: string;
  raw: string;
  acceptanceCriteria: string[];
}

/** Parses a story Markdown file: "# KEY: Title" plus an "Acceptance Criteria" bullet list. */
export function loadStory(file: string): Story {
  const raw = fs.readFileSync(file, 'utf8');
  const heading = raw.match(/^#\s+([A-Z][A-Z0-9]+-\d+)\s*:\s*(.+)$/m);
  const key = heading?.[1] ?? path.basename(file, path.extname(file));
  const title = heading?.[2]?.trim() ?? key;

  const lines = raw.split('\n');
  const acceptanceCriteria: string[] = [];
  let inAc = false;
  for (const line of lines) {
    if (/^#+\s/.test(line)) {
      inAc = /acceptance criteria/i.test(line);
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (inAc && bullet) acceptanceCriteria.push(bullet[1].trim());
  }

  return { key, title, raw, acceptanceCriteria };
}
