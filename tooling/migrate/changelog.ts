import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  classRenames,
  manualApiChanges,
  manualFunctionChanges,
  propValueRenames,
  subpathRenames,
  tokenRenames,
  unmappedClasses,
  utilityRenames,
  variableRenames,
} from './map.js';

const start = '<!-- sapphire-migration:start -->';
const end = '<!-- sapphire-migration:end -->';
const cell = (text: string) =>
  text.replaceAll('|', '\\|').replaceAll('\n', ' ');
function table(title: string, rows: readonly (readonly string[])[]) {
  return `#### ${title}\n\n| Before | After / action |\n|---|---|\n${rows.map(([before = '', after = '']) => `| \`${cell(before)}\` | ${cell(after)} |`).join('\n')}\n`;
}

export function migrationSection() {
  const props = Object.entries(propValueRenames).flatMap(
    ([component, attributes]) =>
      Object.entries(attributes).flatMap(([name, values]) =>
        Object.entries(values).map(([before, after]) => [
          `${component}.${name}="${before}"`,
          `\`${name}="${after}"\``,
        ]),
      ),
  );
  const manual = Object.entries(manualApiChanges).flatMap(
    ([component, attributes]) =>
      Object.entries(attributes).map(([name, action]) => [
        `${component}.${name}`,
        action,
      ]),
  );
  return [
    start,
    '### Migration maps',
    '',
    'Generated from `tooling/migrate/map.ts`. Review ambiguous class names and manual actions; a selector mapping does not imply a safe replacement in arbitrary text.',
    '',
    table(
      'Classes',
      Object.entries(classRenames).map(([before, after]) => [
        before,
        `\`${after}\``,
      ]),
    ),
    table(
      'Tokens',
      Object.entries(tokenRenames)
        .filter(([before, after]) => before !== after)
        .map(([before, after]) => [before, `\`${after}\``]),
    ),
    table(
      'Component variables',
      Object.entries(variableRenames).map(([before, after]) => [
        before,
        `\`${after}\``,
      ]),
    ),
    table(
      'Tailwind colour suffixes',
      Object.entries(utilityRenames.color).map(([before, after]) => [
        before,
        `\`${after}\`; retain utility prefix, variants and opacity`,
      ]),
    ),
    table('React prop values', props),
    table(
      'Public subpaths',
      Object.entries(subpathRenames).map(([before, after]) => [
        before,
        `\`${after}\``,
      ]),
    ),
    table('Manual API changes', manual),
    table('Manual hook changes', Object.entries(manualFunctionChanges)),
    table(
      'Classes without a direct replacement',
      Object.entries(unmappedClasses),
    ),
    end,
  ].join('\n');
}

export function changelogSource(root: string) {
  const text = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  const begin = text.indexOf(start);
  const finish = text.indexOf(end);
  if (begin >= 0 && finish > begin)
    return (
      text.slice(0, begin) +
      migrationSection() +
      text.slice(finish + end.length)
    );
  const nextRelease = text.indexOf('\n## ', text.indexOf('## 4.0.0') + 1);
  if (nextRelease < 0) return `${text.trimEnd()}\n\n${migrationSection()}\n`;
  return (
    text.slice(0, nextRelease).trimEnd() +
    `\n\n${migrationSection()}\n` +
    text.slice(nextRelease)
  );
}

if (import.meta.main)
  writeFileSync(
    join(process.cwd(), 'CHANGELOG.md'),
    changelogSource(process.cwd()),
  );
