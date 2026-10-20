import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { checkItem } from './check.js';
import { generatedRegistry, REGISTRY_SOURCE } from './generate.js';
import {
  collectItem,
  exactDependencies,
  resolvedModule,
  rewrittenSource,
  targetFor,
} from './source.js';

const root = process.cwd();
describe('registry source ownership', () => {
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
