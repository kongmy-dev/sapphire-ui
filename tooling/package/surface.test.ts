import { afterEach, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { apiContract } from './api-contract.js';
import { packageSurface } from './surface.js';

let scratch: string | undefined;
afterEach(() => {
  if (scratch) rmSync(scratch, { recursive: true });
});
it('detects actual emitted type, selector and custom-property changes', () => {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-surface-'));
  scratch = root;
  mkdirSync(join(root, 'css'));
  mkdirSync(join(root, 'components/button'), { recursive: true });
  writeFileSync(
    join(root, 'tsconfig.package.json'),
    JSON.stringify({
      compilerOptions: {
        declaration: true,
        strict: true,
        types: [],
        skipLibCheck: true,
        target: 'ES2023',
      },
    }),
  );
  for (const name of ['base', 'layout', 'tokens'])
    writeFileSync(
      join(root, `css/${name}.css`),
      ':root { --background: white; }',
    );
  const source = join(root, 'components/button/button.tsx');
  const css = join(root, 'components/button/button.css');
  writeFileSync(
    source,
    'export function Button(): string { return "button"; }',
  );
  writeFileSync(css, '.sp-button { color: var(--background); }');
  const baseline = {
    version: '4.0.0',
    releaseNotes: 'Expose the initial button API and its base stylesheet.',
    surface: packageSurface(root),
  };
  const changes = [
    () =>
      writeFileSync(
        source,
        'export function Button(required: string): string { return required; }',
      ),
    () =>
      writeFileSync(css, '.sp-button-renamed { color: var(--background); }'),
    () =>
      writeFileSync(
        join(root, 'css/tokens.css'),
        ':root { --renamed-background: white; }',
      ),
  ];
  for (const change of changes) {
    writeFileSync(
      source,
      'export function Button(): string { return "button"; }',
    );
    writeFileSync(css, '.sp-button { color: var(--background); }');
    writeFileSync(
      join(root, 'css/tokens.css'),
      ':root { --background: white; }',
    );
    change();
    const actual = { ...baseline, surface: packageSurface(root) };
    expect(actual.surface).not.toBe(baseline.surface);
    expect(
      apiContract({
        actual,
        baseline,
        snapshot: actual,
        exportsMatch: true,
      }).violations.some((item) => item.problem.includes('version')),
    ).toBe(true);
  }
});
