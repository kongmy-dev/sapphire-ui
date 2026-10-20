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
const v4 = tokenSheet(read('css/tokens.css'));
const mapping = tokenSheet(read('css/tailwind.css'));

const renames: Record<string, string> = tokenRenames;
const utilityTable: Record<string, Record<string, string>> = utilityRenames;

const unique = (names: readonly string[]) => [...new Set(names)];
const v3Names = unique(v3.map((declaration) => declaration.name));
const v4Names = unique(v4.map((declaration) => declaration.name));

const effective = (value: string | undefined) => normaliseValue(value ?? '');

function valueMismatches(scheme: Scheme): string[] {
  const before = resolveSheet(v3, scheme);
  const after = resolveSheet(v4, scheme);
  return Object.entries(renames).flatMap(([from, to]) => {
    const was = effective(before.get(from));
    const now = effective(after.get(to));
    const same = was !== '' && was === now && !now.includes('var(');
    return same ? [] : [`${scheme}: ${from} is "${was}", ${to} is "${now}"`];
  });
}

describe('v3 tokens map to v4 tokens of the same value', () => {
  it('has a rename entry for every v3 token and none for a token v3 never declared', () => {
    expect(v3Names.filter((name) => !(name in renames))).toEqual([]);
    expect(
      Object.keys(renames).filter((name) => !v3Names.includes(name)),
    ).toEqual([]);
  });

  it('points every rename at a token that css/tokens.css declares', () => {
    expect(
      Object.values(renames).filter((name) => !v4Names.includes(name)),
    ).toEqual([]);
  });

  for (const scheme of SCHEMES) {
    it(`gives each v3 token its v4 token's value in ${scheme}`, () => {
      expect(valueMismatches(scheme)).toEqual([]);
    });
  }

  it('declares no v4 token that neither a rename nor newTokens accounts for', () => {
    const targets = new Set(Object.values(renames));
    const unaccounted = v4Names.filter(
      (name) => !targets.has(name) && !newTokens.some((n) => n === name),
    );
    expect(unaccounted).toEqual([]);
    expect(newTokens.filter((name) => !v4Names.includes(name))).toEqual([]);
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
