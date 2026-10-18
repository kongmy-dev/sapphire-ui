import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classRenames, propValueRenames } from './map';

const read = (path: string) =>
  readFileSync(join(import.meta.dir, '../..', path), 'utf8');

const BTN_CLASS = /\.(btn(?:-[a-z0-9]+)*)(?![\w-])/g;
const ATTRIBUTE = /\[(data-[a-z-]+)(?:=([\w-]+))?\]/g;
const COMMENT = /\/\*[\s\S]*?\*\//g;

const buttonClassesIn = (css: string): string[] => [
  ...new Set(
    [...css.replace(COMMENT, '').matchAll(BTN_CLASS)].map(
      (match) => `.${match[1]}`,
    ),
  ),
];

const withoutEntry = (
  classes: readonly string[],
  map: Record<string, string>,
): string[] => classes.filter((name) => !(name in map));

const attributesIn = (selector: string): [string, string | undefined][] =>
  [...selector.matchAll(ATTRIBUTE)].map((match) => [match[1] ?? '', match[2]]);

const declaredAttributes = (css: string): Set<string> =>
  new Set(
    [...css.matchAll(/\[(data-[a-z-]+)(?:="([\w-]+)")?\]/g)].map(
      (match) => `${match[1]}=${match[2] ?? ''}`,
    ),
  );

const v3Css = read('src/index.css');
const buttonCss = read('components/button/button.css');
const classMap: Record<string, string> = classRenames;

describe('buttonClassesIn', () => {
  it('lists each .btn class once and ignores other prefixes and comments', () => {
    const css = [
      '.btn, .btn-primary:hover { color: red }',
      '.btn-primary { color: blue }',
      '.sf-btn { color: red }',
      '.card .btn-sm::before { color: red }',
      'a { border-radius: var(--radius-btn) }',
      '/* .btn-ghost */',
    ].join('\n');
    expect(buttonClassesIn(css)).toEqual(['.btn', '.btn-primary', '.btn-sm']);
  });
});

describe('withoutEntry', () => {
  it('names a v3 class that the map does not rename', () => {
    const map = { '.btn': '.sp-button' };
    expect(withoutEntry(['.btn', '.btn-new'], map)).toEqual(['.btn-new']);
  });
});

describe('the button class map', () => {
  it('has an entry for every .btn class in the v3 stylesheet', () => {
    expect(withoutEntry(buttonClassesIn(v3Css), classMap)).toEqual([]);
  });

  it('has no entry for a class the v3 stylesheet never declared', () => {
    const declared = buttonClassesIn(v3Css);
    expect(
      Object.keys(classMap).filter((name) => !declared.includes(name)),
    ).toEqual([]);
  });

  it('points every entry at a class and attributes button.css declares', () => {
    const declared = declaredAttributes(buttonCss);
    const missing = Object.entries(classMap).flatMap(([from, to]) => [
      ...(buttonCss.includes('.sp-button') && to.startsWith('.sp-button')
        ? []
        : [`${from}: ${to} is not an sp-button selector`]),
      ...attributesIn(to)
        .filter(([name, value]) => !declared.has(`${name}=${value ?? ''}`))
        .map(
          ([name, value]) =>
            `${from}: ${name}=${value ?? ''} is not in button.css`,
        ),
    ]);
    expect(missing).toEqual([]);
  });
});

describe('the button prop value renames', () => {
  it('rename a variant v3 offers to one button.css declares', () => {
    const v3Button = read('src/components/ui/Button.tsx');
    const declared = declaredAttributes(buttonCss);
    const problems = Object.entries(propValueRenames.Button.variant).flatMap(
      ([from, to]) => [
        ...(new RegExp(`\\b${from}:\\s*\\n?\\s*'`).test(v3Button)
          ? []
          : [`v3 Button has no variant ${from}`]),
        ...(declared.has(`data-variant=${to}`)
          ? []
          : [`button.css has no variant ${to}`]),
      ],
    );
    expect(problems).toEqual([]);
  });
});
