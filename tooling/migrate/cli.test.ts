import { afterEach, expect, it } from 'bun:test';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { migrateApp } from './cli.js';

const roots: string[] = [];
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-migrate-'));
  roots.push(root);
  return root;
}
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

it('checks without writes, applies literal migrations and is unchanged on a second run', () => {
  const root = fixture();
  const path = join(root, 'index.html');
  const before = '<button class="btn btn-outline">Save</button>';
  writeFileSync(path, before);
  expect(migrateApp(root, true).changed).toBe(1);
  expect(readFileSync(path, 'utf8')).toBe(before);
  expect(migrateApp(root, false).unresolved).toBe(0);
  expect(readFileSync(path, 'utf8')).toContain('data-variant="outline"');
  expect(migrateApp(root, false).changed).toBe(0);
});

it('ignores dependencies, generated directories and symlinks outside the target', () => {
  const root = fixture();
  const external = fixture();
  const before = '<button class="btn-outline"/>';
  for (const folder of ['node_modules', 'dist', 'vendor']) {
    mkdirSync(join(root, folder));
    writeFileSync(join(root, folder, 'view.html'), before);
  }
  writeFileSync(join(external, 'view.html'), before);
  symlinkSync(external, join(root, 'linked'));
  symlinkSync(join(external, 'view.html'), join(root, 'linked.html'));
  expect(migrateApp(root, false)).toEqual({
    changed: 0,
    unresolved: 0,
    report: [],
  });
  expect(readFileSync(join(external, 'view.html'), 'utf8')).toBe(before);
  expect(() => migrateApp(join(root, 'linked'), false)).toThrow('directory');
});

function cli(args: string[]) {
  return Bun.spawnSync(
    [process.execPath, join(import.meta.dir, 'cli.ts'), ...args],
    { stderr: 'pipe', stdout: 'pipe' },
  );
}

it('returns nonzero for pending edits and manual work, accepts clean runs and rejects ambiguous targets', () => {
  const root = fixture();
  writeFileSync(join(root, 'index.html'), '<button class="btn-outline"/>');
  expect(cli([root, '--check']).exitCode).toBe(1);
  expect(cli([root]).exitCode).toBe(0);
  expect(cli([root, '--check']).exitCode).toBe(0);
  writeFileSync(
    join(root, 'legacy.cjs'),
    'const ui = require("@kongmy-dev/sapphire-ui/button");',
  );
  const result = cli([root]);
  expect(result.exitCode).toBe(1);
  expect(result.stdout.toString()).toContain('legacy.cjs:1: manual: CommonJS');
  expect(cli([root, root]).stderr.toString()).toContain('Usage:');
  expect(cli([root, '--unknown']).exitCode).toBe(1);
});
