import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  normaliseValue,
  resolveSheet,
  SCHEMES,
  type Scheme,
  tokenSheet,
} from '../source/token-values';
import legacyFacts from './legacy-facts.json' with { type: 'json' };
import { newTokens, tokenRenames, utilityRenames } from './map';

const read = (path: string) =>
  readFileSync(join(import.meta.dir, '../..', path), 'utf8');

const v3Theme = legacyFacts.themeTokens;
const v3Index = legacyFacts.indexTokens;
const v3 = [...v3Theme, ...v3Index];
const current = tokenSheet(read('css/tokens.css'));
const mapping = tokenSheet(read('css/tailwind.css'));

const renames: Record<string, string> = tokenRenames;
const utilityTable: Record<string, Record<string, string>> = utilityRenames;

const unique = (names: readonly string[]) => [...new Set(names)];
const v3Names = unique(v3.map((declaration) => declaration.name));
const currentNames = unique(current.map((declaration) => declaration.name));

const semanticValues: Record<string, Record<Scheme, string>> = {
  '--color-primary': { light: '#0a192f', dark: '#c5a065' },
  '--color-primary-hover': { light: '#1a3358', dark: '#b8904f' },
  '--color-primary-foreground': { light: '#f1f5f9', dark: '#0a192f' },
  '--color-sidebar': { light: '#fff', dark: '#112240' },
  '--color-sidebar-foreground': { light: '#1e293b', dark: '#f1f5f9' },
  '--color-sidebar-accent': {
    light: 'rgb(197,160,101,0.08)',
    dark: 'rgb(197,160,101,0.08)',
  },
  '--color-sidebar-accent-foreground': { light: '#1e293b', dark: '#f1f5f9' },
  '--color-sidebar-border': {
    light: '#e2e8f0',
    dark: 'rgb(255,255,255,0.12)',
  },
};

const effective = (value: string | undefined) => normaliseValue(value ?? '');

function valueMismatches(scheme: Scheme): string[] {
  const before = resolveSheet(v3, scheme);
  const after = resolveSheet(current, scheme);
  return Object.entries(renames).flatMap(([from, to]) => {
    const was = effective(before.get(from));
    const now = effective(after.get(to));
    const expected = semanticValues[from]?.[scheme] ?? was;
    const same = was !== '' && expected === now && !now.includes('var(');
    return same
      ? []
      : [`${scheme}: ${from} expects "${expected}", ${to} is "${now}"`];
  });
}

describe('v3 tokens retain values except for explicit current semantic changes', () => {
  it('has a rename entry for every v3 token and none for a token v3 never declared', () => {
    expect(v3Names.filter((name) => !(name in renames))).toEqual([]);
    expect(
      Object.keys(renames).filter((name) => !v3Names.includes(name)),
    ).toEqual([]);
  });

  it('points every rename at a token that css/tokens.css declares', () => {
    expect(
      Object.values(renames).filter((name) => !currentNames.includes(name)),
    ).toEqual([]);
  });

  for (const scheme of SCHEMES) {
    it(`preserves values or matches the pinned current semantic value in ${scheme}`, () => {
      expect(valueMismatches(scheme)).toEqual([]);
    });
  }

  it('pins only renamed tokens whose semantics change in at least one scheme', () => {
    const unchanged = Object.entries(semanticValues).filter(([from, values]) =>
      SCHEMES.every(
        (scheme) =>
          effective(resolveSheet(v3, scheme).get(from)) === values[scheme],
      ),
    );
    expect(unchanged).toEqual([]);
    expect(
      Object.keys(semanticValues).filter((name) => !(name in renames)),
    ).toEqual([]);
  });

  it('keeps the former dark surface token fixed navy in both schemes', () => {
    expect(renames['--bg-dark']).toBe('--brand-navy');
    for (const scheme of SCHEMES) {
      expect(effective(resolveSheet(current, scheme).get('--brand-navy'))).toBe(
        '#0a192f',
      );
    }
  });

  it('declares no current token that neither a rename nor newTokens accounts for', () => {
    const targets = new Set(Object.values(renames));
    const unaccounted = currentNames.filter(
      (name) => !targets.has(name) && !newTokens.some((n) => n === name),
    );
    expect(unaccounted).toEqual([]);
    expect(newTokens.filter((name) => !currentNames.includes(name))).toEqual(
      [],
    );
  });

  it('agrees between the two v3 files on every token both declare', () => {
    const disagreements = SCHEMES.flatMap((scheme) => {
      const theme = resolveSheet(v3Theme, scheme);
      const index = resolveSheet(v3Index, scheme);
      return [...theme.keys()]
        .filter((name) => index.has(name))
        .filter(
          (name) => effective(theme.get(name)) !== effective(index.get(name)),
        )
        .map((name) => `${scheme}: ${name}`);
    });
    expect(disagreements).toEqual([]);
  });
});

const NAMESPACES = [
  'color',
  'font',
  'text',
  'leading',
  'radius',
  'shadow',
] as const;
type Namespace = (typeof NAMESPACES)[number];

const entriesIn = (namespace: Namespace) =>
  mapping
    .filter((entry) => entry.name.startsWith(`--${namespace}-`))
    .map((entry) => ({
      key: entry.name.slice(`--${namespace}-`.length),
      value: entry.value,
    }));

function utilityKey(namespace: Namespace, from: string, target: string) {
  const candidates = entriesIn(namespace)
    .filter((entry) => entry.value === `var(${target})`)
    .map((entry) => entry.key);
  return candidates.includes(from) ? from : (candidates[0] ?? null);
}

function derivedRenames(namespace: Namespace): Record<string, string | null> {
  const found: Record<string, string | null> = {};
  for (const name of unique(v3Theme.map((entry) => entry.name))) {
    const target = renames[name];
    if (!name.startsWith(`--${namespace}-`) || target === undefined) continue;
    const from = name.slice(`--${namespace}-`.length);
    const to = utilityKey(namespace, from, target);
    if (to !== from) found[from] = to;
  }
  return found;
}

describe('v3 utilities keep their name or have a rename entry', () => {
  for (const namespace of NAMESPACES) {
    it(`renames exactly the ${namespace} utilities whose theme key changed`, () => {
      expect(derivedRenames(namespace)).toEqual(utilityTable[namespace] ?? {});
    });
  }
});
