import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { commentRanges, isExportJsDoc, parseSource } from '../source/parse';

export type StrayComment = { file: string; line: number; text: string };

const FIXED_FORMS = [
  /^\/\/ vendor: https?:\/\/\S+ \S/,
  /^\/\/ ADR-\d{4}$/,
  /^\/\/ biome-ignore \S+: \S/,
  /^\/\/ @ts-expect-error https?:\/\/\S+/,
  /^\/\/ a11y: \S+/,
  /^\/\* SPDX-License-Identifier: \S+ \*\/$/,
];

const SOURCE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export const isFixedForm = (comment: string) =>
  FIXED_FORMS.some((form) => form.test(comment));

export function strayComments(file: string, text: string): StrayComment[] {
  const source = parseSource(file, text);
  return commentRanges(source)
    .filter((range) => !isExportJsDoc(source, range, text))
    .map((range) => ({
      file,
      line: source.getLineAndCharacterOfPosition(range.pos).line + 1,
      text: text.slice(range.pos, range.end),
    }))
    .filter((comment) => !isFixedForm(comment.text));
}

const preview = (comment: string) => {
  const firstLine = comment.split('\n')[0] ?? '';
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
};

export function getChangedSourceFiles(root: string): string[] {
  try {
    const stdout = execSync('git diff --name-only --diff-filter=ACMR HEAD', {
      cwd: root,
      encoding: 'utf8',
    });
    return stdout
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0 && SOURCE_FILE.test(f))
      .filter((f) => f.startsWith('src/') || f.startsWith('registry/'))
      .filter((f) => existsSync(resolve(root, f)));
  } catch {
    return [];
  }
}

function exitWithoutFiles(hadArguments: boolean): never {
  if (hadArguments) {
    console.error(
      'Comment gate: no source file to check. A gate that checked nothing fails.',
    );
    process.exit(1);
  }
  console.log('Comment gate: 0 changed source files to check.');
  process.exit(0);
}

function main() {
  const root = process.cwd();
  const given = process.argv.slice(2);
  const named = given.filter((f) => SOURCE_FILE.test(f));
  const files = (named.length ? named : getChangedSourceFiles(root))
    .map((f) => relative(root, resolve(root, f)))
    .filter((f) => !f.startsWith('..') && existsSync(resolve(root, f)));

  if (!files.length) exitWithoutFiles(given.length > 0);

  const stray = files.flatMap((file) =>
    strayComments(file, readFileSync(resolve(root, file), 'utf8')),
  );

  if (!stray.length) {
    console.log(
      `Comment gate: ${files.length} file(s), no comment outside allowed forms.`,
    );
    process.exit(0);
  }

  console.error(
    `\nComment gate — ${stray.length} comment(s) outside allowed forms (P-1).\n`,
  );
  for (const comment of stray) {
    console.error(
      `  ${comment.file}:${comment.line}  ${preview(comment.text)}`,
    );
  }
  console.error(
    '\nMove what each comment knows into a name, a type, a test, JSDoc on an export, or docs/, then delete it.\n',
  );
  process.exit(1);
}

if (import.meta.main) main();
