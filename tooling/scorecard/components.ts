import { subpathRenames } from '../migrate/map';
import { isTest } from '../quality-metrics/check';
import { pinsOf } from '../visual/specimens';

export const REGISTRY_SOURCE = 'registry.json';
export const PIN_DIR = 'tests/visual/pins';

export type ComponentRow = {
  name: string;
  css: boolean;
  react: boolean;
  examples: boolean;
  pin: boolean;
  element: boolean;
  registry: boolean;
};

const V3_FILE = /^src\/components\/(?:.*\/)?(?<base>[^/]+)\.tsx?$/;
const V4_FOLDER = /^components\/(?<name>[^/]+)\//;
const PIN_FILE = new RegExp(
  `^${PIN_DIR}/(?<route>[^/]+)/(?<slug>.+)\\.(?:light|dark)\\.png$`,
);

const kebab = (name: string) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();

const isIndexOrTypes = (path: string) =>
  /(^|\/)index\.tsx?$/.test(path) || path.endsWith('.d.ts');

const v4FolderOf: Readonly<Record<string, string>> = subpathRenames;

function v3Name(path: string): string | null {
  if (isTest(path) || isIndexOrTypes(path)) return null;
  const base = V3_FILE.exec(path)?.groups?.base;
  if (base === undefined) return null;
  const name = kebab(base.replace(/Element$/, ''));
  return v4FolderOf[name] ?? name;
}

const v4Name = (path: string): string | null =>
  V4_FOLDER.exec(path)?.groups?.name ?? null;

export function componentNames(paths: readonly string[]): string[] {
  const names = paths
    .map((path) => v3Name(path) ?? v4Name(path))
    .filter((name): name is string => name !== null);
  return [...new Set(names)].sort();
}

function registryItemNames(sourceText: string | null): Set<string> {
  if (sourceText === null) return new Set();
  try {
    const parsed: unknown = JSON.parse(sourceText);
    const items =
      typeof parsed === 'object' && parsed !== null && 'items' in parsed
        ? parsed.items
        : null;
    if (!Array.isArray(items)) return new Set();
    return new Set(
      items.flatMap((item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        typeof item.name === 'string'
          ? [item.name]
          : [],
      ),
    );
  } catch {
    return new Set();
  }
}

export type Specimens = ReadonlyMap<string, string>;

const specimenPath = (name: string) =>
  `components/${name}/${name}.examples.html`;

export function componentTable(
  paths: readonly string[],
  registryText: string | null,
  specimens: Specimens,
): ComponentRow[] {
  const present = new Set(paths);
  const registered = registryItemNames(registryText);
  return componentNames(paths).map((name) => ({
    name,
    css: present.has(`components/${name}/${name}.css`),
    react: present.has(`components/${name}/${name}.tsx`),
    examples: present.has(`components/${name}/${name}.examples.tsx`),
    pin:
      pinsOf(specimens.get(specimenPath(name)) ?? '').length > 0 ||
      paths.some((path) =>
        ['react', 'native'].some((kind) =>
          path.startsWith(`${PIN_DIR}/${kind}/${name}/`),
        ),
      ),
    element: present.has(`elements/${name}.ts`),
    registry: registered.has(name),
  }));
}

export function referencePinCount(
  paths: readonly string[],
  specimens: Specimens,
): number {
  const covered = new Set(
    [...specimens.values()].flatMap((html) => pinsOf(html)),
  );
  return paths.filter((path) => {
    const { route, slug } = PIN_FILE.exec(path)?.groups ?? {};
    return (
      route !== undefined &&
      !['react', 'native', 'states'].includes(route) &&
      !covered.has(`${route}/${slug}`)
    );
  }).length;
}
