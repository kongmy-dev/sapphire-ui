#!/usr/bin/env bun
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { productBlocks, productItems } from '../registry/items.ts';

const BLOCKS_DIR = 'registry/blocks';
const REGISTRY_NAME = 'sapphire-ui';
const HOMEPAGE = process.env.REGISTRY_HOMEPAGE ?? 'https://design.kongmy.dev';
const SRC_UI = 'src/components/ui';
const THEME_SRC = 'src/theme.css';
const OUT_DIR = process.env.REGISTRY_OUT ?? 'dist-docs/r';

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';

const CONSUMER_PROVIDED_PACKAGES = new Set(['react', 'react-dom']);
const IMPORT_SPECIFIER = /from\s+['"]([^'"]+)['"]/g;
const REGISTRY_ITEM_IMPORT = /@\/components\/ui\/([a-z][a-z0-9-]*)/g;

type ItemSpec = {
  name: string;
  type: 'registry:ui' | 'registry:block';
  title: string;
  description: string;
  sourcePath: string;
};

const registryDependencyUrl = (name: string) => `${HOMEPAGE}/r/${name}.json`;

function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function packageName(specifier: string): string {
  const segments = specifier.split('/');
  return (
    specifier.startsWith('@') ? segments.slice(0, 2) : segments.slice(0, 1)
  ).join('/');
}

function capturedGroups(content: string, pattern: RegExp): string[] {
  return [...content.matchAll(pattern)].flatMap((match) => match[1] ?? []);
}

function rewriteLibraryImports(source: string): string {
  return source
    .replace(/(['"])\.\.\/\.\.\/lib\/utils\1/g, "'@/lib/utils'")
    .replace(/(['"])\.\.\/\.\.\/hooks\/([A-Za-z0-9]+)\1/g, "'@/hooks/$2'")
    .replace(
      /(['"])\.\/([A-Z][A-Za-z0-9]*)\1/g,
      (_match: string, _quote: string, component: string) =>
        `'@/components/ui/${pascalToKebab(component)}'`,
    );
}

function processSource(fullPath: string) {
  const content = rewriteLibraryImports(readFileSync(fullPath, 'utf8'));
  const registryDependencies = [
    ...new Set(capturedGroups(content, REGISTRY_ITEM_IMPORT)),
  ].sort();
  const packages = capturedGroups(content, IMPORT_SPECIFIER)
    .filter(
      (specifier) => !specifier.startsWith('.') && !specifier.startsWith('@/'),
    )
    .map(packageName)
    .filter((name) => !CONSUMER_PROVIDED_PACKAGES.has(name));
  return {
    content,
    dependencies: [...new Set(packages)].sort(),
    registryDependencies,
  };
}

function buildThemeItem() {
  const file = {
    path: 'sapphire-theme.css',
    content: readFileSync(THEME_SRC, 'utf8'),
    type: 'registry:file',
    target: 'styles/sapphire-theme.css',
  };
  const noRegistryItems: string[] = [];
  const item = {
    $schema: ITEM_SCHEMA,
    name: 'theme',
    type: 'registry:style',
    title: 'Sapphire Theme',
    description:
      'Sapphire design tokens (Tailwind v4 @theme) + shadcn-var aliases. Import once per app; required by every Sapphire component.',
    dependencies: noRegistryItems,
    registryDependencies: noRegistryItems,
    files: [file],
  };
  const indexFile = { path: file.path, type: file.type, target: file.target };
  return { name: item.name, item, indexEntry: { ...item, files: [indexFile] } };
}

function buildItem(spec: ItemSpec) {
  const { content, dependencies, registryDependencies } = processSource(
    spec.sourcePath,
  );
  const summary = {
    name: spec.name,
    type: spec.type,
    title: spec.title,
    description: spec.description,
    dependencies,
    registryDependencies: ['theme', ...registryDependencies].map(
      registryDependencyUrl,
    ),
  };
  const target = `components/ui/${spec.name}.tsx`;
  const path = `ui/${spec.name}.tsx`;
  return {
    name: spec.name,
    item: {
      $schema: ITEM_SCHEMA,
      ...summary,
      files: [{ path, content, type: spec.type, target }],
    },
    indexEntry: { ...summary, files: [{ path, type: spec.type, target }] },
  };
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const built = [
    buildThemeItem(),
    ...productItems.map(({ name, source, title, description }) =>
      buildItem({
        name,
        type: 'registry:ui',
        title,
        description,
        sourcePath: join(SRC_UI, `${source}.tsx`),
      }),
    ),
    ...productBlocks.map(({ name, file, title, description }) =>
      buildItem({
        name,
        type: 'registry:block',
        title,
        description,
        sourcePath: join(BLOCKS_DIR, file),
      }),
    ),
  ];
  for (const { name, item } of built)
    writeJson(join(OUT_DIR, `${name}.json`), item);
  writeJson(join(OUT_DIR, 'registry.json'), {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage: HOMEPAGE,
    items: built.map(({ indexEntry }) => indexEntry),
  });
  console.log(
    `registry: wrote theme + ${productItems.length} items + ${productBlocks.length} blocks + registry.json to ${OUT_DIR}`,
  );
}

main();
