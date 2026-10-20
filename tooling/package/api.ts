import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { finish } from '../gates/report.js';
import { apiContract, parseApiSnapshot, releaseNotes } from './api-contract.js';
import { packageEntries } from './entries.js';
import { packageSurface } from './surface.js';

const SNAPSHOT = 'tooling/package/api-snapshot.json';
function committedSnapshot(root: string, revision: string) {
  const result = Bun.spawnSync(['git', 'show', `${revision}:${SNAPSHOT}`], {
    cwd: root,
  });
  return result.exitCode === 0
    ? parseApiSnapshot(result.stdout.toString())
    : null;
}

async function manifest(root: string) {
  const pkg: unknown = await Bun.file(join(root, 'package.json')).json();
  if (
    typeof pkg !== 'object' ||
    !pkg ||
    !('version' in pkg) ||
    typeof pkg.version !== 'string' ||
    !('exports' in pkg)
  )
    throw new Error('Invalid package manifest');
  return { version: pkg.version, exports: pkg.exports };
}

async function main() {
  const root = process.cwd();
  const pkg = await manifest(root);
  const actual = {
    version: pkg.version,
    releaseNotes: releaseNotes(
      readFileSync(join(root, 'CHANGELOG.md'), 'utf8'),
      pkg.version,
    ),
    surface: packageSurface(root),
  };
  const path = join(root, SNAPSHOT);
  const snapshot = existsSync(path)
    ? parseApiSnapshot(readFileSync(path, 'utf8'))
    : null;
  const head = committedSnapshot(root, 'HEAD');
  const baseline =
    head?.surface === actual.surface ? committedSnapshot(root, 'HEAD^') : head;
  const exportsMatch =
    JSON.stringify(pkg.exports) === JSON.stringify(packageEntries(root));
  if (process.argv.includes('--write')) {
    const checked = apiContract({
      actual,
      snapshot: actual,
      baseline,
      exportsMatch,
    });
    if (checked.violations.length) finish(checked);
    writeFileSync(
      path,
      `${JSON.stringify({ ...actual, surface: actual.surface.split('\n') }, null, 2)}\n`,
    );
  }
  finish(
    apiContract({
      actual,
      snapshot: process.argv.includes('--write') ? actual : snapshot,
      baseline,
      exportsMatch,
    }),
  );
}

if (import.meta.main) await main();
