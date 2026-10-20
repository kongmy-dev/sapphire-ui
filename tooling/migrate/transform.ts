import { extname } from 'node:path';
import { componentImports } from './api.js';
import { migrateCss } from './css.js';
import { migrateHtml } from './html.js';
import { migrateJsx } from './jsx.js';
import { applyEdits, type Migration } from './result.js';
import { validScript } from './syntax.js';

function astroFrontmatter(text: string, migration: Migration) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!match?.[1]) return new Map<string, string>();
  const offset = match[0].indexOf(match[1]);
  const local: Migration = { edits: [], issues: [] };
  if (!validScript('frontmatter.ts', match[1], local)) {
    migration.issues.push(
      ...local.issues.map((issue) => ({ ...issue, line: issue.line + 1 })),
    );
    return new Map<string, string>();
  }
  const names = componentImports('frontmatter.ts', match[1], local);
  migration.edits.push(
    ...local.edits.map((edit) => ({
      ...edit,
      start: edit.start + offset,
      end: edit.end + offset,
    })),
  );
  migration.issues.push(
    ...local.issues.map((issue) => ({ ...issue, line: issue.line + 1 })),
  );
  return names;
}

export function migrateText(file: string, text: string) {
  const migration: Migration = { edits: [], issues: [] };
  const extension = extname(file);
  if (extension === '.css') migrateCss(text, migration);
  else if (extension === '.html' || extension === '.astro') {
    const names =
      extension === '.astro'
        ? astroFrontmatter(text, migration)
        : new Map<string, string>();
    migrateHtml(text, migration, names);
  } else migrateJsx(file, text, migration);
  return applyEdits(text, migration);
}
