import { existsSync, readdirSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { componentStylesheets } from '../css/stylesheet.js';

export function packageSources(root: string): string[] {
  function visit(folder: string): string[] {
    if (!existsSync(folder)) return [];
    return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
      const path = join(folder, entry.name);
      if (entry.isDirectory())
        return entry.name.endsWith('-tests') ? [] : visit(path);
      return /(?<!\.test|\.examples)\.tsx?$/.test(path)
        ? [relative(root, path)]
        : [];
    });
  }
  return ['components', 'elements', 'hooks', 'lib']
    .flatMap((name) => visit(join(root, name)))
    .sort();
}

function publicKey(source: string) {
  const name = basename(source).replace(/\.tsx?$/, '');
  if (source === `components/${name}/${name}.tsx`) return `./${name}`;
  if (source.startsWith('elements/') || source.startsWith('hooks/'))
    return `./${source.replace(/\.ts$/, '')}`;
  if (['lib/theme.ts', 'lib/consent.ts'].includes(source)) return `./${name}`;
  if (source === 'components/seo-head/seo-tags.ts') return './seo-tags';
  return null;
}

export function packageEntries(root: string) {
  const entries: Record<string, { types: string; import: string } | string> =
    {};
  const add = (key: string, source: string) => {
    const output = source.replace(/\.tsx?$/, '');
    entries[key] = {
      types: `./dist/${output}.d.ts`,
      import: `./dist/${output}.js`,
    };
  };
  for (const source of packageSources(root)) {
    const key = publicKey(source);
    if (key) add(key, source);
  }
  for (const source of componentStylesheets(root))
    entries[`./${basename(source)}`] = `./dist/${source}`;
  for (const name of ['sapphire', 'foundations', 'fonts', 'tailwind'])
    entries[`./${name}.css`] = `./dist/${name}.css`;
  entries['./style.css'] = './dist/sapphire.css';
  return Object.fromEntries(
    Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)),
  );
}
