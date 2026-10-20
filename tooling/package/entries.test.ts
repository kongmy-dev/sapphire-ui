import { afterEach, expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { packageEntries, packageSources } from './entries.js';

const scratch: string[] = [];
afterEach(() => {
  for (const path of scratch.splice(0)) rmSync(path, { recursive: true });
});
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'sapphire-exports-'));
  scratch.push(root);
  for (const file of [
    'components/button/button.tsx',
    'components/button/button.css',
    'components/button/private.ts',
    'components/button/button.test.tsx',
    'components/button/button.examples.tsx',
    'hooks/use-debounce.ts',
    'elements/banner.ts',
    'elements/banner.examples.ts',
    'lib/theme.ts',
    'lib/slot.tsx',
    'lib/slot-tests/fixture.tsx',
  ]) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), '');
  }
  return root;
}
it('exports exact public entries and CSS while keeping emitted internals private', () => {
  const root = fixture();
  const entries = packageEntries(root);
  expect(entries['./button']).toEqual({
    types: './dist/components/button/button.d.ts',
    import: './dist/components/button/button.js',
  });
  expect(entries['./button.css']).toBe('./dist/components/button/button.css');
  expect(entries['./elements/banner']).toBeDefined();
  expect(entries['./hooks/use-debounce']).toBeDefined();
  expect(entries['./theme']).toBeDefined();
  expect(entries['./button/private']).toBeUndefined();
  expect(entries['./lib/slot']).toBeUndefined();
  expect(entries['.']).toBeUndefined();
  expect(Object.keys(entries).some((key) => key.includes('*'))).toBe(false);
  expect(packageSources(root)).toContain('components/button/private.ts');
  expect(packageSources(root).some((file) => /test|examples/.test(file))).toBe(
    false,
  );
});
