import { expect, test } from 'bun:test';
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('site output replaces stale assets and excludes build-only entry sources', () => {
  const out = mkdtempSync(join(tmpdir(), 'sapphire-site-output-'));
  writeFileSync(join(out, 'obsolete-v3.js'), 'old output');
  const built = Bun.spawnSync(
    [process.execPath, 'tooling/site/build.ts', out],
    { cwd: process.cwd(), stdout: 'pipe', stderr: 'pipe' },
  );
  expect(built.stderr.toString()).toBe('');
  expect(built.exitCode).toBe(0);
  expect(existsSync(join(out, 'obsolete-v3.js'))).toBe(false);
  expect(existsSync(join(out, 'components/button/index.html'))).toBe(true);
  expect(existsSync(join(out, 'r/button.json'))).toBe(true);
  const files = readdirSync(join(out, 'assets'), { recursive: true });
  expect(files.some((file) => /\.[cm]?tsx?$/.test(String(file)))).toBe(false);
  expect(files).toContain('examples-entry.js');
  expect(files).toContain('elements-entry.js');
});
