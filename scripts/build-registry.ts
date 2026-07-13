#!/usr/bin/env bun
/**
 * Build the Sapphire UI product registry (shadcn format).
 *
 * For each item in registry/items.ts:
 *   1. read the library source (src/components/ui/<Source>.tsx),
 *   2. rewrite the library's relative imports to the shadcn `@/` alias,
 *   3. derive npm `dependencies` + `registryDependencies` from the imports,
 *   4. emit a self-contained registry-item JSON to <outDir>/<name>.json.
 *
 * Also emits <outDir>/registry.json (the index). Output dir defaults to
 * dist-docs/r (served at design.kongmy.dev/r/<name>.json); override with
 * REGISTRY_OUT. The library's own npm build is untouched — this only reads.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { productBlocks, productItems } from '../registry/items.ts';

const BLOCKS_DIR = 'registry/blocks';

const REGISTRY_NAME = 'sapphire-ui';
const HOMEPAGE = 'https://design.kongmy.dev';
const SRC_UI = 'src/components/ui';
const THEME_SRC = 'src/theme.css';
const OUT_DIR = process.env.REGISTRY_OUT ?? 'dist-docs/r';

const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
const REGISTRY_SCHEMA = 'https://ui.shadcn.com/schema/registry.json';

// react/react-dom are peer deps every consumer already has; shadcn omits them.
const PEER_DEPS = new Set(['react', 'react-dom']);

function pascalToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Bare package name from a specifier: '@radix-ui/react-slot' -> '@radix-ui/react-slot', 'clsx/x' -> 'clsx'. */
function packageBase(spec: string): string {
  if (spec.startsWith('@')) return spec.split('/').slice(0, 2).join('/');
  return spec.split('/')[0];
}

interface Processed {
  content: string;
  dependencies: string[];
  registryDependencies: string[];
}

function processSource(fullPath: string): Processed {
  let content = readFileSync(fullPath, 'utf8');

  // Rewrite library-relative imports to the shadcn `@/` alias (product items in
  // src/ use relative paths; blocks in registry/blocks/ are already aliased).
  content = content.replace(/(['"])\.\.\/\.\.\/lib\/utils\1/g, "'@/lib/utils'");
  content = content.replace(
    /(['"])\.\.\/\.\.\/hooks\/([A-Za-z0-9]+)\1/g,
    "'@/hooks/$2'",
  );
  content = content.replace(
    /(['"])\.\/([A-Z][A-Za-z0-9]*)\1/g,
    (_match, _quote, comp: string) =>
      `'@/components/ui/${pascalToKebab(comp)}'`,
  );

  // registryDependencies: any `@/components/ui/<name>` import — unified across
  // rewritten product refs and blocks that compose primitives directly.
  const registryDependencies = new Set<string>();
  for (const match of content.matchAll(
    /@\/components\/ui\/([a-z][a-z0-9-]*)/g,
  )) {
    registryDependencies.add(match[1]);
  }

  // npm deps from bare (non-relative, non-alias) imports
  const dependencies = new Set<string>();
  for (const match of content.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const spec = match[1];
    if (spec.startsWith('.') || spec.startsWith('@/')) continue;
    const base = packageBase(spec);
    if (!PEER_DEPS.has(base)) dependencies.add(base);
  }

  return {
    content,
    dependencies: [...dependencies].sort(),
    registryDependencies: [...registryDependencies].sort(),
  };
}

/**
 * The `theme` item ships Sapphire's `theme.css` verbatim — the single source,
 * which already carries the brand tokens, the shadcn semantic-token layer, and
 * the dark-mode block. `shadcn add theme` bootstraps a project's tokens with no
 * npm package. Every utility the product items use must resolve from these
 * tokens (enforced by scripts/check-registry.ts).
 */
function buildThemeItem() {
  const content = readFileSync(THEME_SRC, 'utf8');
  const file = {
    path: 'sapphire-theme.css',
    content,
    type: 'registry:file',
    target: 'styles/sapphire-theme.css',
  };
  const item = {
    $schema: ITEM_SCHEMA,
    name: 'theme',
    type: 'registry:style',
    title: 'Sapphire Theme',
    description:
      'Sapphire design tokens (Tailwind v4 @theme) + shadcn-var aliases. Import once per app; required by every Sapphire component.',
    dependencies: [] as string[],
    registryDependencies: [] as string[],
    files: [file],
  };
  return {
    item,
    indexEntry: {
      ...item,
      files: [{ path: file.path, type: file.type, target: file.target }],
    },
  };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const indexItems: Array<Record<string, unknown>> = [];

  const theme = buildThemeItem();
  writeFileSync(
    join(OUT_DIR, 'theme.json'),
    `${JSON.stringify(theme.item, null, 2)}\n`,
  );
  indexItems.push(theme.indexEntry);

  for (const item of productItems) {
    const { content, dependencies, registryDependencies } = processSource(
      join(SRC_UI, `${item.source}.tsx`),
    );
    // Every component requires the token layer — make `theme` an explicit dep
    // so `shadcn add <component>` also pulls the tokens it renders against.
    const allRegistryDeps = ['theme', ...registryDependencies];
    const file = {
      path: `ui/${item.name}.tsx`,
      content,
      type: 'registry:ui',
      target: `components/ui/${item.name}.tsx`,
    };
    const registryItem = {
      $schema: ITEM_SCHEMA,
      name: item.name,
      type: 'registry:ui',
      title: item.title,
      description: item.description,
      dependencies,
      registryDependencies: allRegistryDeps,
      files: [file],
    };
    writeFileSync(
      join(OUT_DIR, `${item.name}.json`),
      `${JSON.stringify(registryItem, null, 2)}\n`,
    );
    indexItems.push({
      name: item.name,
      type: 'registry:ui',
      title: item.title,
      description: item.description,
      dependencies,
      registryDependencies: allRegistryDeps,
      files: [{ path: file.path, type: file.type, target: file.target }],
    });
  }

  for (const block of productBlocks) {
    const { content, dependencies, registryDependencies } = processSource(
      join(BLOCKS_DIR, block.file),
    );
    const allRegistryDeps = ['theme', ...registryDependencies];
    const file = {
      path: `ui/${block.name}.tsx`,
      content,
      type: 'registry:block',
      target: `components/ui/${block.name}.tsx`,
    };
    const registryItem = {
      $schema: ITEM_SCHEMA,
      name: block.name,
      type: 'registry:block',
      title: block.title,
      description: block.description,
      dependencies,
      registryDependencies: allRegistryDeps,
      files: [file],
    };
    writeFileSync(
      join(OUT_DIR, `${block.name}.json`),
      `${JSON.stringify(registryItem, null, 2)}\n`,
    );
    indexItems.push({
      name: block.name,
      type: 'registry:block',
      title: block.title,
      description: block.description,
      dependencies,
      registryDependencies: allRegistryDeps,
      files: [{ path: file.path, type: file.type, target: file.target }],
    });
  }

  const registry = {
    $schema: REGISTRY_SCHEMA,
    name: REGISTRY_NAME,
    homepage: HOMEPAGE,
    items: indexItems,
  };
  writeFileSync(
    join(OUT_DIR, 'registry.json'),
    `${JSON.stringify(registry, null, 2)}\n`,
  );

  console.log(
    `registry: wrote theme + ${productItems.length} items + ${productBlocks.length} blocks + registry.json to ${OUT_DIR}`,
  );
}

main();
