import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { buildStylesheet } from '../css/build.js';
import { componentStylesheets } from '../css/stylesheet.js';

function fontUrls(css: string) {
  return css.replace(
    /url\(\s*(["']?)([^"')]+\.woff2)\1\s*\)/g,
    (_match, _quote, url: string) => `url(./fonts/${basename(url)})`,
  );
}

async function buildCss(input: {
  root: string;
  outdir: string;
  source: string;
  output: string;
}) {
  const result = await Bun.build({
    entrypoints: [join(input.root, input.source)],
    minify: true,
    external: ['*.woff2'],
  });
  if (!result.success)
    throw new Error(result.logs.map((log) => log.message).join('\n'));
  const css = await result.outputs[0]?.text();
  if (!css) throw new Error(`No CSS emitted for ${input.source}`);
  const target = join(input.outdir, input.output);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, fontUrls(css));
}

export async function buildPackageStyles(root: string, outdir: string) {
  await buildStylesheet(root, outdir, { minify: true });
  for (const family of ['newsreader', 'source-sans-3', 'jetbrains-mono'])
    copyFileSync(
      join(root, 'node_modules/@fontsource-variable', family, 'LICENSE'),
      join(outdir, 'fonts', `${family}-LICENSE.txt`),
    );
  const entry = join(outdir, '.foundations.source.css');
  const imports = ['layers', 'fonts', 'tokens', 'base', 'layout']
    .map((name) => `@import "${join(root, `css/${name}.css`)}";`)
    .join('\n');
  writeFileSync(entry, imports);
  try {
    await buildCss({
      root,
      outdir,
      source: relative(root, entry),
      output: 'foundations.css',
    });
  } finally {
    unlinkSync(entry);
  }
  await buildCss({
    root,
    outdir,
    source: 'css/fonts.css',
    output: 'fonts.css',
  });
  await buildCss({
    root,
    outdir,
    source: 'css/tailwind.css',
    output: 'tailwind.css',
  });
  for (const source of componentStylesheets(root)) {
    await buildCss({ root, outdir, source, output: source });
    const target = join(outdir, source);
    writeFileSync(
      target,
      readFileSync(join(root, 'css/layers.css'), 'utf8') +
        readFileSync(target, 'utf8'),
    );
  }
}
