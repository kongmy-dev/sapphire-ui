import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { STYLESHEET_FILE } from './stylesheet';

export const FONT_DIR = 'fonts';

const FONT_SOURCE_DIR = 'css';
const FONT_URL = /url\(\s*(["']?)([^"')]+\.woff2)\1\s*\)/g;

export type Built = { stylesheet: string; fonts: string[] };

export async function buildStylesheet(
  root: string,
  outdir: string,
  options: { minify: boolean },
): Promise<Built> {
  const result = await Bun.build({
    entrypoints: [join(root, STYLESHEET_FILE)],
    outdir,
    minify: options.minify,
    external: ['*.woff2'],
  });
  if (!result.success) {
    throw new Error(result.logs.map((log) => log.message).join('\n'));
  }
  const stylesheet = join(outdir, STYLESHEET_FILE);
  const fontNames = new Map<string, string>();
  const css = readFileSync(stylesheet, 'utf8').replace(
    FONT_URL,
    (_call, _quote, url: string) => {
      const name = basename(url);
      fontNames.set(name, resolve(root, FONT_SOURCE_DIR, url));
      return `url(./${FONT_DIR}/${name})`;
    },
  );
  mkdirSync(join(outdir, FONT_DIR), { recursive: true });
  for (const [name, source] of fontNames) {
    copyFileSync(source, join(outdir, FONT_DIR, name));
  }
  writeFileSync(stylesheet, css);
  return { stylesheet, fonts: [...fontNames.keys()].sort() };
}
