import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { buildStylesheet } from '../css/build';
import type { ExampleRow } from './catalog';
import { readElementExamples } from './elements';

function entrySource(root: string, row: ExampleRow, native: boolean) {
  const mount = native ? 'mountElementExample' : 'mountExample';
  const browser = native ? 'element-browser.ts' : 'browser.tsx';
  return [
    `import {${mount}} from ${JSON.stringify(join(root, 'tooling/examples', browser))};`,
    `import {examples} from ${JSON.stringify(resolve(root, row.file))};`,
    `${mount}({${JSON.stringify(row.component)}:examples});`,
  ].join('\n');
}

function writeEntries(
  root: string,
  sources: string,
  rows: readonly ExampleRow[],
  native: boolean,
) {
  const entries: string[] = [];
  const unique = new Map(rows.map((row) => [row.component, row]));
  for (const row of unique.values()) {
    const base = join(sources, native ? 'native' : 'examples', row.component);
    mkdirSync(dirname(base), { recursive: true });
    const script = `${base}.tsx`;
    const css = `${base}.css`;
    writeFileSync(script, entrySource(root, row, native));
    const layout = resolve(root, row.file.replace(/\.tsx?$/, '.css'));
    writeFileSync(
      css,
      existsSync(layout) ? `@import ${JSON.stringify(layout)};` : '',
    );
    entries.push(script, css);
  }
  return entries;
}

export async function buildProductionExamples({
  root,
  out,
  examples,
}: {
  root: string;
  out: string;
  examples: readonly ExampleRow[];
}) {
  if (!examples.length)
    throw new Error('Production examples need a non-empty React catalogue');
  await buildStylesheet(root, out, { minify: true });
  const sources = mkdtempSync(join(tmpdir(), 'sapphire-production-examples-'));
  try {
    const result = await Bun.build({
      entrypoints: [
        ...writeEntries(root, sources, examples, false),
        ...writeEntries(root, sources, readElementExamples(root), true),
      ],
      root: sources,
      outdir: out,
      target: 'browser',
      splitting: true,
      minify: true,
      publicPath: '/assets/',
      naming: {
        entry: '[dir]/[name].[ext]',
        chunk: 'chunks/[name]-[hash].[ext]',
        asset: '[name]-[hash].[ext]',
      },
      define: { 'process.env.NODE_ENV': '"production"' },
    });
    if (!result.success)
      throw new Error(result.logs.map((log) => log.message).join('\n'));
  } finally {
    rmSync(sources, { recursive: true, force: true });
  }
}
