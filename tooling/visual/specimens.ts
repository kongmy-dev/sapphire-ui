import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Scheme } from '../source/token-values';

export const SPECIMEN_PORT = 4175;
export const SPECIMEN_URL = `http://localhost:${SPECIMEN_PORT}`;
const SPECIMEN_SUFFIX = '.examples.html';
const DEMO_STYLESHEET_SUFFIX = '.examples.css';

const BASE_SPECIMEN = 'css/base.examples.html';
const COMPONENTS_DIR = 'components';
const COMPONENT_SPECIMEN = /^components\/([^/]+)\/([^/]+)\.examples\.html$/;
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

export const isSpecimenFile = (path: string): boolean => {
  const [, folder, name] = COMPONENT_SPECIMEN.exec(path) ?? [];
  return path === BASE_SPECIMEN || (folder !== undefined && folder === name);
};

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

export const demoStylesheetOf = (specimen: string): string =>
  `${specimen.slice(0, -SPECIMEN_SUFFIX.length)}${DEMO_STYLESHEET_SUFFIX}`;

export const specimenUrl = (file: string, scheme: Scheme): string =>
  `${SPECIMEN_URL}/${file}?scheme=${scheme}`;

export type SpecimenPage = {
  file: string;
  fragment: string;
  scheme: Scheme;
  hasDemoStylesheet: boolean;
};

export const specimenPage = ({
  file,
  fragment,
  scheme,
  hasDemoStylesheet,
}: SpecimenPage): string =>
  [
    '<!doctype html>',
    `<html lang="en" data-theme="${scheme}">`,
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${file}</title>`,
    '<link rel="stylesheet" href="/sapphire.css">',
    '<link rel="stylesheet" href="/specimen.css">',
    ...(hasDemoStylesheet
      ? [`<link rel="stylesheet" href="/${demoStylesheetOf(file)}">`]
      : []),
    '</head>',
    '<body>',
    '<div class="docs-layout">',
    '<div class="docs-sidebar"></div>',
    '<main class="docs-main">',
    fragment,
    '</main>',
    '</div>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
