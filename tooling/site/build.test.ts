import { expect, test } from 'bun:test';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
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
  expect(existsSync(join(out, 'v3-v4'))).toBe(false);
  expect(existsSync(join(out, 'preview.html'))).toBe(false);
  expect(existsSync(join(out, 'assets/comparison.css'))).toBe(false);
  const files = readdirSync(join(out, 'assets'), { recursive: true });
  expect(files.some((file) => /\.[cm]?tsx?$/.test(String(file)))).toBe(false);
  expect(files).not.toContain('examples-entry.js');
  expect(files).not.toContain('elements-entry.js');
  expect(files).not.toContain('equivalence.js');
  expect(files).not.toContain('examples.css');
  expect(files).toContain('examples/button.js');
  expect(files).toContain('examples/button.css');
  expect(files).toContain('native/banner.js');
  const button = readFileSync(
    join(out, 'components/button/index.html'),
    'utf8',
  );
  expect(button).toContain('src="/assets/examples/button.js"');
  expect(button).toContain('href="/assets/examples/button.css"');
  expect(button).not.toContain('/assets/examples/form-field');
  expect(button).not.toContain('/assets/examples-entry.js');
  const styles = readFileSync(join(out, 'assets/examples/button.css'), 'utf8');
  expect(styles).toContain('.docs-button-hint');
  expect(styles).not.toContain('.docs-form-field-demo');
  const shared = readFileSync(join(out, 'assets/sapphire.css'), 'utf8');
  expect(shared).toContain('.sp-prose');
  expect(shared).toContain('.sp-command-palette');
});
