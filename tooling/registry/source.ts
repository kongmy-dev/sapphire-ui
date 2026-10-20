import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, relative, resolve } from 'node:path';
import { sourceImports } from '../source/imports.js';

const components = [
  'button',
  'input',
  'textarea',
  'label',
  'separator',
  'checkbox',
  'radio-group',
  'select',
  'native-select',
  'dialog',
  'sheet',
  'dropdown-menu',
  'popover',
  'tooltip',
  'table',
  'tabs',
  'card',
  'badge',
  'form-field',
  'skeleton',
  'spinner',
  'empty',
  'pagination',
  'stat',
  'stat-group',
];
const blocks = [
  'sonner',
  'command',
  'combobox',
  'calendar',
  'sidebar',
  'data-table-column-header',
  'data-table-view-options',
];
export const registryEntries = [
  ...components.map((name) => ({
    name,
    entry: `components/${name}/${name}.tsx`,
    type: 'registry:ui',
  })),
  ...blocks.map((name) => ({
    name: name === 'sonner' ? 'toaster' : name,
    entry: `blocks/${name}/${name}.tsx`,
    type: 'registry:block',
  })),
];
const npmName = (specifier: string) =>
  specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : (specifier.split('/')[0] ?? specifier);

export function resolvedModule(
  root: string,
  file: string,
  specifier: string,
): string {
  const path = resolve(root, dirname(file), specifier);
  const bare = path.replace(/\.js$/, '');
  const found = [path, `${bare}.ts`, `${bare}.tsx`].find(existsSync);
  if (!found) throw new Error(`${file}: unresolved module ${specifier}`);
  return relative(root, found);
}

export function targetFor(file: string): string {
  const parts = file.split('/');
  const [layer, name, leaf] = parts;
  if (layer === 'lib') return `@lib/sapphire/${name}`;
  if (layer === 'hooks') return `@hooks/${name}`;
  if (file === 'blocks/classes.ts') return '@lib/sapphire/classes.ts';
  if (leaf === `${name}.tsx`) return `@ui/${name}.tsx`;
  return `@ui/_sapphire/${name}/${parts.slice(2).join('/')}`;
}

type Dependency = { kind: 'file' | 'package' | 'registry'; name: string };
function dependencyOf(
  root: string,
  file: string,
  specifier: string | null,
  owner: string,
): Dependency {
  if (!specifier)
    throw new Error(`${file}: dynamic import is not self-contained`);
  if (!specifier.startsWith('.'))
    return { kind: 'package', name: npmName(specifier) };
  const imported = resolvedModule(root, file, specifier);
  const importedOwner = imported.split('/').slice(0, 2).join('/');
  const foreign =
    imported.startsWith('components/') || imported.startsWith('blocks/');
  if (!foreign || importedOwner === owner || imported === 'blocks/classes.ts')
    return { kind: 'file', name: imported };
  const dep = registryEntries.find((item) =>
    item.entry.startsWith(`${importedOwner}/`),
  );
  if (!dep) throw new Error(`${file}: missing registry entry for ${imported}`);
  return { kind: 'registry', name: `@sapphire/${dep.name}` };
}

export function collectItem(root: string, entry: string) {
  const found = {
    file: new Set([entry]),
    package: new Set<string>(['react']),
    registry: new Set<string>(),
  };
  const owner = entry.split('/').slice(0, 2).join('/');
  for (const file of found.file) {
    const edges = sourceImports(
      file,
      readFileSync(resolve(root, file), 'utf8'),
    );
    for (const edge of edges) {
      const dependency = dependencyOf(root, file, edge.specifier, owner);
      found[dependency.kind].add(dependency.name);
    }
  }
  return {
    files: [...found.file].sort(),
    dependencies: [...found.package].sort(),
    registryDependencies: [...found.registry].sort(),
  };
}

export function rewrittenSource(
  root: string,
  file: string,
  text: string,
): string {
  const edges = sourceImports(file, text).filter((edge) =>
    edge.specifier?.startsWith('.'),
  );
  let next = text;
  for (const edge of edges) {
    if (!edge.specifier) continue;
    const target = targetFor(
      resolvedModule(root, file, edge.specifier),
    ).replace(/\.[cm]?tsx?$/, '');
    const alias = target
      .replace('@ui/', '@/components/ui/')
      .replace('@lib/', '@/lib/')
      .replace('@hooks/', '@/hooks/');
    next = next
      .replaceAll(`'${edge.specifier}'`, `'${alias}'`)
      .replaceAll(`"${edge.specifier}"`, `"${alias}"`);
  }
  return next;
}

export function exactDependencies(
  root: string,
  names: readonly string[],
): string[] {
  const pkg: unknown = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );
  if (
    typeof pkg !== 'object' ||
    pkg === null ||
    !('devDependencies' in pkg) ||
    typeof pkg.devDependencies !== 'object' ||
    pkg.devDependencies === null
  )
    throw new Error('Missing exact development dependencies');
  const versions = Object.fromEntries(Object.entries(pkg.devDependencies));
  return names.map((name) => {
    const version: unknown = versions[name];
    if (
      typeof version !== 'string' ||
      !/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version)
    )
      throw new Error(`Unpinned registry dependency: ${name}`);
    return `${name}@${version}`;
  });
}

export const registryFile = (file: string) => ({
  path: file,
  type: extname(file) === '.css' ? 'registry:file' : 'registry:component',
  target: targetFor(file),
});
