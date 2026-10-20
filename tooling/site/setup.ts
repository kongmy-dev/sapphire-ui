import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolvedModule } from '../registry/source';
import { sourceImports } from '../source/imports';

function sourcePackages(root: string, entries: readonly string[]) {
  const files = new Set(entries);
  const packages = new Set<string>();
  for (const file of files) {
    const edges = fileDependencies(root, file);
    for (const entry of edges.files) files.add(entry);
    for (const name of edges.packages) packages.add(name);
  }
  return [...packages];
}

function fileDependencies(root: string, file: string) {
  const text = readFileSync(join(root, file), 'utf8');
  const edges = sourceImports(file, text).map(({ specifier }) =>
    dependency(root, file, specifier),
  );
  return {
    files: edges.flatMap((edge) => (edge.file ? [edge.file] : [])),
    packages: edges.flatMap((edge) => (edge.package ? [edge.package] : [])),
  };
}

function dependency(root: string, file: string, specifier: string | null) {
  if (!specifier) throw new Error(`${file}: setup needs a static import`);
  return specifier.startsWith('.')
    ? { file: resolvedModule(root, file, specifier) }
    : { package: specifier };
}

function runtimeImport({
  root,
  entry,
  name,
  native,
}: {
  root: string;
  entry: string;
  name: string;
  native: boolean;
}) {
  if (native) return `import "@kongmy-dev/sapphire-ui/elements/${name}";`;
  const text = readFileSync(join(root, entry), 'utf8');
  const exported = /export (?:function|const) (\w+)/.exec(text)?.[1] ?? name;
  return `import { ${exported} } from "@kongmy-dev/sapphire-ui/${name}";`;
}

export function componentSetup(root: string, name: string, native: boolean) {
  const entry = native
    ? `elements/${name}.ts`
    : `components/${name}/${name}.tsx`;
  const runtime = existsSync(join(root, entry));
  const dependencies = sourcePackages(root, runtime ? [entry] : []);
  const peers = runtime && !native ? ['react', 'react-dom'] : [];
  const packages = new Set([
    '@kongmy-dev/sapphire-ui',
    ...peers,
    ...dependencies,
  ]);
  const imports = ['import "@kongmy-dev/sapphire-ui/sapphire.css";'];
  if (runtime) imports.push(runtimeImport({ root, entry, name, native }));
  return {
    imports: imports.join('\n'),
    install: `bun add ${[...packages].join(' ')}`,
  };
}
