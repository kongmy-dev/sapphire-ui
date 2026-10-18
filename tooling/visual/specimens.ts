import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Scheme } from '../source/token-values';

export const SPECIMEN_PORT = 4175;
export const SPECIMEN_URL = `http://localhost:${SPECIMEN_PORT}`;
export const SPECIMEN_SUFFIX = '.examples.html';

const BASE_SPECIMEN = 'css/base.examples.html';
const COMPONENTS_DIR = 'components';
const PIN = /<section\b[^>]*\bdata-pin="([^"]+)"/g;

export function specimenFiles(root: string): string[] {
  const folder = join(root, COMPONENTS_DIR);
  const components = existsSync(folder)
    ? readdirSync(folder, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map(
          (entry) =>
            `${COMPONENTS_DIR}/${entry.name}/${entry.name}${SPECIMEN_SUFFIX}`,
        )
    : [];
  return [BASE_SPECIMEN, ...components]
    .filter((file) => existsSync(join(root, file)))
    .sort();
}

export const pinsOf = (html: string): string[] =>
  [...html.matchAll(PIN)].map((match) => match[1] ?? '');

export type Specimen = { file: string; pins: string[] };

export const readSpecimens = (root: string): Specimen[] =>
  specimenFiles(root).map((file) => ({
    file,
    pins: pinsOf(readFileSync(join(root, file), 'utf8')),
  }));

export const coveredPins = (root: string): string[] =>
  readSpecimens(root).flatMap((specimen) => specimen.pins);

export function pinProblems(
  specimens: readonly Specimen[],
  known: readonly string[],
): string[] {
  const seen = new Map<string, string>();
  return specimens.flatMap(({ file, pins }) =>
    pins.flatMap((pin) => {
      const first = seen.get(pin);
      seen.set(pin, first ?? file);
      if (!known.includes(pin)) return [`${file}: unknown pin ${pin}`];
      return first === undefined ? [] : [`${file}: ${pin} is also in ${first}`];
    }),
  );
}

export const specimenUrl = (file: string, scheme: Scheme): string =>
  `${SPECIMEN_URL}/${file}?scheme=${scheme}`;

export const specimenPage = (
  file: string,
  fragment: string,
  scheme: Scheme,
): string =>
  [
    '<!doctype html>',
    `<html lang="en" data-theme="${scheme}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${file}</title>`,
    '<link rel="stylesheet" href="/sapphire.css">',
    '<link rel="stylesheet" href="/specimen.css">',
    '</head>',
    '<body>',
    '<div class="docs-layout">',
    '<main class="docs-main">',
    fragment,
    '</main>',
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
