import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { checkFile } from '../quality-metrics/check';

function getChangedFiles(root: string): string[] {
  const set = new Set<string>();
  const collect = (cmd: string) => {
    try {
      const out = execSync(cmd, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      for (const line of out.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && /\.(ts|tsx)$/.test(trimmed) && existsSync(resolve(root, trimmed))) {
          set.add(trimmed);
        }
      }
    } catch {
      // ignore git command failure if ref not found
    }
  };

  collect('git diff --name-only --diff-filter=ACMR HEAD');
  collect('git diff --name-only --diff-filter=ACMR origin/master...HEAD');
  collect('git diff --cached --name-only --diff-filter=ACMR');

  return [...set];
}

const root = process.cwd();
const files = getChangedFiles(root);

if (files.length === 0) {
  console.log('Size gate: 0 changed TypeScript file(s) to check.');
  process.exit(0);
}

const findings = files.flatMap((f) => checkFile(root, f));

if (!findings.length) {
  console.log(`Size gate: ${files.length} changed file(s) checked, 0 findings.`);
  process.exit(0);
}

console.error(`\nSize gate — ${findings.length} finding(s) in changed files:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}\n    ${f.message}\n`);
}
process.exit(1);
