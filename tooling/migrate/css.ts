import { scanCss } from '../source/css.js';
import { classRenames, tokenRenames, variableRenames } from './map.js';
import { issueAt, type Migration } from './result.js';

const renames: Readonly<Record<string, string>> = {
  ...tokenRenames,
  ...variableRenames,
};
const classes: Readonly<Record<string, string>> = classRenames;
function migrateToken(
  masked: string,
  match: RegExpExecArray,
  migration: Migration,
) {
  const before = masked.slice(0, match.index);
  const after = masked.slice(match.index + match[0].length);
  const declaration = /(?:^|[;{])\s*$/.test(before) && /^\s*:/.test(after);
  if (!/var\(\s*$/.test(before) && !declaration) return;
  const next = renames[match[0]];
  if (next && next !== match[0])
    migration.edits.push({
      start: match.index,
      end: match.index + match[0].length,
      text: next,
    });
}

function importNotices(text: string, masked: string, migration: Migration) {
  for (const match of text.matchAll(/@import\s+(['"])([^'"]+)\1/g)) {
    if (!masked.slice(match.index).startsWith('@import')) continue;
    if (match[2]?.includes('@kongmy-dev/sapphire-ui/theme.css'))
      migration.issues.push(
        issueAt(
          text,
          match.index,
          'theme.css: choose the Tailwind mapping or foundations import for this pipeline',
        ),
      );
  }
}

export function migrateCss(text: string, migration: Migration) {
  const { masked } = scanCss(text);
  for (const match of masked.matchAll(/--[a-zA-Z][\w-]*/g))
    migrateToken(masked, match, migration);
  for (const match of masked.matchAll(/\.[\w-]+/g)) {
    if (classes[match[0]])
      migration.issues.push(
        issueAt(
          text,
          match.index,
          `${match[0]}: migrate this application CSS selector manually`,
        ),
      );
  }
  importNotices(text, masked, migration);
}
