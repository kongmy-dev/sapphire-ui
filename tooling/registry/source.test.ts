import { afterEach, describe, expect, test } from 'bun:test';
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkItem } from './check.js';
import { generatedRegistry, REGISTRY_SOURCE } from './generate.js';
import {
  collectItem,
  exactDependencies,
  registryEntries,
  resolvedModule,
  rewrittenSource,
  targetFor,
} from './source.js';

const root = process.cwd();
const fixtures: string[] = [];
afterEach(() => {
  for (const fixture of fixtures.splice(0))
    rmSync(fixture, { recursive: true, force: true });
});

function versionFixture(version: unknown) {
  const directory = mkdtempSync(join(tmpdir(), 'sapphire-registry-version-'));
  fixtures.push(directory);
  for (const name of ['components', 'blocks', 'lib', 'hooks', 'node_modules'])
    symlinkSync(join(root, name), join(directory, name));
  const manifest: unknown = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8'),
  );
  if (typeof manifest !== 'object' || manifest === null)
    throw new Error('Invalid fixture manifest');
  writeFileSync(
    join(directory, 'package.json'),
    JSON.stringify({ ...manifest, version }),
  );
  return directory;
}

describe('registry source ownership', () => {
  test('derives every foundations range and base dependency from the package version', () => {
    const generated = generatedRegistry(versionFixture('7.2.3'));
    const foundations = Array.from(
      generated.matchAll(/"foundations":\s*"([^"]+)"/g),
      (match) => match[1],
    );
    expect(foundations).toHaveLength(registryEntries.length + 1);
    expect(foundations.every((version) => version === '^7.2.3')).toBe(true);
    expect(generated).toContain('@kongmy-dev/sapphire-ui@7.2.3');
  });
  test('rejects a missing package version before generating compatibility metadata', () => {
    expect(() => generatedRegistry(versionFixture(undefined))).toThrow(
      'Missing package version',
    );
  });
  test('button carries its Slot implementation and exact peers', () => {
    const item = collectItem(root, 'components/button/button.tsx');
    expect(item.files).toContain('lib/slot.tsx');
    expect(item.dependencies).toContain('react');
    expect(
      exactDependencies(root, item.dependencies).every((name) =>
        /@\d+\.\d+\.\d+$/.test(name),
      ),
    ).toBe(true);
    expect(
      rewrittenSource(
        root,
        'components/button/button.tsx',
        readFileSync('components/button/button.tsx', 'utf8'),
      ),
    ).toContain('@/lib/sapphire/slot');
  });
  test('sidebar declares foreign component dependencies and owns its helpers', () => {
    const item = collectItem(root, 'blocks/sidebar/sidebar.tsx');
    expect(item.registryDependencies).toContain('@sapphire/sheet');
    expect(item.registryDependencies).toContain('@sapphire/button');
    expect(item.files).toContain('blocks/sidebar/sidebar-context.tsx');
    expect(item.files).toContain('blocks/sidebar/sidebar-menu.tsx');
    expect(item.files).toContain('blocks/classes.ts');
  });
  test('targets preserve helper isolation and node-style imports', () => {
    expect(targetFor('components/button/button.tsx')).toBe('@ui/button.tsx');
    expect(targetFor('components/dialog/dialog-close.tsx')).toBe(
      '@ui/_sapphire/dialog/dialog-close.tsx',
    );
    expect(targetFor('hooks/use-mobile.ts')).toBe('@hooks/use-mobile.ts');
    expect(
      resolvedModule(root, 'components/button/button.tsx', '../../lib/slot.js'),
    ).toBe('lib/slot.tsx');
    expect(() =>
      resolvedModule(root, 'components/button/button.tsx', './missing.js'),
    ).toThrow('unresolved');
    expect(() => exactDependencies(root, ['not-installed'])).toThrow(
      'Unpinned',
    );
  });
  test('data-table composes owned controls and admin source carries shared state', () => {
    const table = collectItem(root, 'blocks/data-table/data-table.tsx');
    expect(table.registryDependencies).toContain('@sapphire/table');
    expect(table.registryDependencies).toContain(
      '@sapphire/data-table-column-header',
    );
    expect(table.registryDependencies).toContain(
      '@sapphire/data-table-view-options',
    );
    expect(table.dependencies).toContain('@tanstack/react-table');
    const admin = collectItem(root, 'components/admin-layout/admin-layout.tsx');
    expect(admin.files).toContain('lib/navigation-state.ts');
    expect(admin.files).toContain('components/admin-layout/admin-context.tsx');
    expect(admin.files).toContain(
      'components/admin-layout/admin-navigation.tsx',
    );
    expect(admin.registryDependencies).toContain('@sapphire/sheet');
    expect(admin.registryDependencies).toContain('@sapphire/tooltip');
    expect(admin.registryDependencies).toContain('@sapphire/popover');
  });
  test('generated metadata stays reproducible and base has one foundations import', () => {
    expect(readFileSync(REGISTRY_SOURCE, 'utf8')).toBe(generatedRegistry(root));
    const generated = generatedRegistry(root);
    expect(generated).toContain('@kongmy-dev/sapphire-ui/foundations.css');
    expect(generated).not.toContain('@fontsource');
    expect(generated).not.toContain('sapphire.css');
  });
});
describe('built registry validation', () => {
  test('allows self-contained alias imports with exact dependencies', () => {
    expect(
      checkItem(
        JSON.stringify({
          dependencies: ['react@19.2.7'],
          files: [
            {
              path: 'button.tsx',
              content:
                "import * as React from 'react'; import { Slot } from '@/lib/sapphire/slot';",
            },
          ],
        }),
      ),
    ).toEqual([]);
  });
  test('rejects bare dependencies, unresolved source paths and omitted dependencies', () => {
    const failures = checkItem(
      JSON.stringify({
        dependencies: ['react'],
        files: [
          {
            path: 'button.tsx',
            content: "import 'radix-ui'; import './missing.js';",
          },
        ],
      }),
    );
    expect(failures).toHaveLength(3);
    expect(checkItem('{}')).toEqual(['Missing files']);
    expect(checkItem('{"files":[{}]}')).toEqual(['Missing file content']);
  });
});
