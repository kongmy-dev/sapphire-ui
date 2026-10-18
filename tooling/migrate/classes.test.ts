import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { componentStylesheets } from '../css/stylesheet';
import { classRenames, propValueRenames, unmappedClasses } from './map';

const ROOT = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(ROOT, path), 'utf8');

const CLASS = /\.([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(?![\w-])/g;
const TARGET_CLASS = /^\.sp-[a-z0-9]+(?:-[a-z0-9]+)*/;
const ATTRIBUTE = /\[(data-[a-z-]+)(?:=([\w-]+))?\]/g;
const DECLARED_ATTRIBUTE = /\[(data-[a-z-]+)(?:="([\w-]+)")?\]/g;
const COMMENT = /\/\*[\s\S]*?\*\//g;

const classesIn = (css: string): string[] => [
  ...new Set(
    [...css.replace(COMMENT, '').matchAll(CLASS)].map(
      (match) => `.${match[1]}`,
    ),
  ),
];

const stemOf = (name: string): string => name.slice(1).split('-')[0] ?? '';

const withoutEntry = (
  classes: readonly string[],
  map: Record<string, string>,
): string[] => classes.filter((name) => !(name in map));

const attributesIn = (selector: string): [string, string | undefined][] =>
  [...selector.matchAll(ATTRIBUTE)].map((match) => [match[1] ?? '', match[2]]);

const declaredAttributes = (css: string): Set<string> =>
  new Set(
    [...css.matchAll(DECLARED_ATTRIBUTE)].map(
      (match) => `${match[1]}=${match[2] ?? ''}`,
    ),
  );

const declares = (css: string, selectorClass: string): boolean =>
  new RegExp(`${selectorClass.replace('.', '\\.')}(?![\\w-])`).test(css);

const componentCss = (): Record<string, string> =>
  Object.fromEntries(
    componentStylesheets(ROOT).map((path) => [
      path.split('/')[1] ?? '',
      read(path),
    ]),
  );

const v3Css = read('src/index.css');
const v3Classes = classesIn(v3Css);
const classMap: Record<string, string> = classRenames;
const unmapped: Record<string, string> = unmappedClasses;
const propRenames: Record<
  string,
  Record<string, Record<string, string>>
> = propValueRenames;
const sheets = componentCss();

describe('classesIn', () => {
  it('lists each class once and ignores comments and file extensions', () => {
    const css = [
      '.btn, .btn-primary:hover { color: red }',
      '.btn-primary { color: blue }',
      '.card .btn-sm::before { color: red }',
      'a { border-radius: var(--radius-btn); margin: 0.5rem }',
      '/* .btn-ghost */',
    ].join('\n');
    expect(classesIn(css)).toEqual([
      '.btn',
      '.btn-primary',
      '.card',
      '.btn-sm',
    ]);
  });
});

describe('withoutEntry', () => {
  it('names a v3 class that the map does not rename', () => {
    const map = { '.btn': '.sp-button' };
    expect(withoutEntry(['.btn', '.btn-new'], map)).toEqual(['.btn-new']);
  });
});

describe('the class map', () => {
  it('has an entry for every v3 class of a family it renames', () => {
    const families = new Set(Object.keys(classMap).map(stemOf));
    const inFamilies = v3Classes.filter((name) => families.has(stemOf(name)));
    expect(withoutEntry(inFamilies, { ...classMap, ...unmapped })).toEqual([]);
  });

  it('has no entry for a class the v3 stylesheet never declared', () => {
    const declared = new Set(v3Classes);
    expect(
      [...Object.keys(classMap), ...Object.keys(unmapped)].filter(
        (name) => !declared.has(name),
      ),
    ).toEqual([]);
  });

  it('lists a class as unmapped or renamed, never both', () => {
    expect(Object.keys(unmapped).filter((name) => name in classMap)).toEqual(
      [],
    );
  });

  it('points every entry at a class and attributes its component declares', () => {
    const problems = Object.entries(classMap).flatMap(([from, to]) => {
      const target = TARGET_CLASS.exec(to)?.[0];
      const css = Object.values(sheets).filter(
        (sheet) => target !== undefined && declares(sheet, target),
      );
      if (css.length === 0) return [`${from}: ${to} is no sp-* class`];
      const declared = new Set(
        css.flatMap((sheet) => [...declaredAttributes(sheet)]),
      );
      return attributesIn(to)
        .filter(([name, value]) => !declared.has(`${name}=${value ?? ''}`))
        .map(
          ([name, value]) =>
            `${from}: ${name}=${value ?? ''} is not declared for ${target}`,
        );
    });
    expect(problems).toEqual([]);
  });
});

describe('the prop value renames', () => {
  it('rename a value v3 offers to one the component declares', () => {
    const problems = Object.entries(propRenames).flatMap(([component, props]) =>
      Object.entries(props).flatMap(([prop, values]) =>
        Object.entries(values).flatMap(([from, to]) => {
          const name = component.toLowerCase();
          const v3Source = read(`src/components/ui/${component}.tsx`);
          const declared = declaredAttributes(sheets[name] ?? '');
          return [
            ...(new RegExp(`\\b${from}:\\s*\\n?\\s*'`).test(v3Source)
              ? []
              : [`v3 ${component} has no ${prop} ${from}`]),
            ...(declared.has(`data-${prop}=${to}`)
              ? []
              : [`${name}.css has no ${prop} ${to}`]),
          ];
        }),
      ),
    );
    expect(problems).toEqual([]);
  });
});
