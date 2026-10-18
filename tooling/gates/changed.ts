import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkFile } from '../quality-metrics/check';

const CHANGED_FILE_COMMANDS = [
  'git diff --name-only --diff-filter=ACMR HEAD',
  'git diff --name-only --diff-filter=ACMR origin/master...HEAD',
  'git diff --cached --name-only --diff-filter=ACMR',
];

function gitOutputOrNothing(root: string, command: string): string {
  try {
    return execSync(command, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function changedTypeScriptFiles(root: string): string[] {
  const names = CHANGED_FILE_COMMANDS.flatMap((command) =>
    gitOutputOrNothing(root, command)
      .split('\n')
      .map((line) => line.trim()),
  );
  return [
    ...new Set(
      names.filter(
        (name) => /\.(ts|tsx)$/.test(name) && existsSync(resolve(root, name)),
      ),
    ),
  ];
}

function main() {
  const root = process.cwd();
  const files = changedTypeScriptFiles(root);

  if (files.length === 0) {
    console.log('Size gate: 0 changed TypeScript file(s) to check.');
    return;
  }

  const findings = files.flatMap((f) => checkFile(root, f));

  if (!findings.length) {
    console.log(
      `Size gate: ${files.length} changed file(s) checked, 0 findings.`,
    );
    return;
  }

  console.error(
    `\nSize gate — ${findings.length} finding(s) in changed files:\n`,
  );
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}\n    ${f.message}\n`);
  }
  process.exit(1);
}

main();
