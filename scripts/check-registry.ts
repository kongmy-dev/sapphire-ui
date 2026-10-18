#!/usr/bin/env bun
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SAPPHIRE_VAR =
  /--(?:color|radius|font|text|leading|space|shadow|transition)-[a-z0-9-]+/g;
const DEP_URL = /^https:\/\/design\.kongmy\.dev\/r\/([a-z0-9-]+)\.json$/;
const RELATIVE_IMPORT = /from\s+['"](\.[^'"]*)['"]/g;
const CUSTOM_CLASS = /[\s'"`](k-[a-z][a-z-]*)/g;
const DECLARED_VAR = /(--[a-z0-9-]+)\s*:/g;
const CONSUMER_ITEM_TYPES = ['registry:ui', 'registry:block'];

type RegistryItem = {
  name: string;
  type: string;
  registryDependencies?: string[];
  files: { content: string }[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const isFileWithContent = (value: unknown): value is { content: string } =>
  isRecord(value) && typeof value.content === 'string';

function isRegistryItem(value: unknown): value is RegistryItem {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    (value.registryDependencies === undefined ||
      isStringArray(value.registryDependencies)) &&
    Array.isArray(value.files) &&
    value.files.every(isFileWithContent)
  );
}

function buildToTemp(): string {
  const out = mkdtempSync(join(tmpdir(), 'sapphire-registry-'));
  const proc = Bun.spawnSync(['bun', 'scripts/build-registry.ts'], {
    env: { ...process.env, REGISTRY_OUT: out },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (proc.exitCode !== 0) {
    console.error(proc.stderr.toString());
    throw new Error('build-registry failed');
  }
  return out;
}

function readItem(dir: string, file: string): RegistryItem {
  const parsed: unknown = JSON.parse(readFileSync(join(dir, file), 'utf8'));
  if (!isRegistryItem(parsed))
    throw new Error(`${file} is not a registry item`);
  return parsed;
}

function readItems(dir: string): RegistryItem[] {
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json') && file !== 'registry.json')
    .map((file) => readItem(dir, file));
}

function capturedGroups(content: string, pattern: RegExp): string[] {
  return [...content.matchAll(pattern)].flatMap((match) => match[1] ?? []);
}

function themeVariables(items: RegistryItem[]): Set<string> {
  const theme = items.find((item) => item.name === 'theme');
  if (!theme) throw new Error('no theme item generated');
  const themeCss = theme.files.map((file) => file.content).join('\n');
  return new Set(capturedGroups(themeCss, DECLARED_VAR));
}

function dependencyProblems(item: RegistryItem, names: Set<string>): string[] {
  return (item.registryDependencies ?? []).flatMap((dep) => {
    const name = dep.match(DEP_URL)?.[1];
    if (name === undefined) {
      return [
        `${item.name}: registryDependency "${dep}" must be a full https://design.kongmy.dev/r/<name>.json URL (bare names resolve against shadcn's default registry)`,
      ];
    }
    if (names.has(name)) return [];
    return [`${item.name}: registryDependency "${dep}" is not a registry item`];
  });
}

function contentProblems(
  itemName: string,
  content: string,
  definedVars: Set<string>,
): string[] {
  const leakedImports = capturedGroups(content, RELATIVE_IMPORT).map(
    (specifier) => `${itemName}: leaked relative import "${specifier}"`,
  );
  const undefinedTokens = (content.match(SAPPHIRE_VAR) ?? [])
    .filter((ref) => !definedVars.has(ref))
    .map((ref) => `${itemName}: references undefined token "${ref}"`);
  const customClasses = capturedGroups(content, CUSTOM_CLASS).map(
    (cls) =>
      `${itemName}: references custom class "${cls}" (not tailwind/shadcn — inline it)`,
  );
  return [...leakedImports, ...undefinedTokens, ...customClasses];
}

function itemProblems(
  item: RegistryItem,
  names: Set<string>,
  definedVars: Set<string>,
): string[] {
  const problems = dependencyProblems(item, names);
  if (!CONSUMER_ITEM_TYPES.includes(item.type)) return problems;
  return [
    ...problems,
    ...item.files.flatMap((file) =>
      contentProblems(item.name, file.content, definedVars),
    ),
  ];
}

function main() {
  const items = readItems(buildToTemp());
  const names = new Set(items.map((item) => item.name));
  const definedVars = themeVariables(items);
  const errors = items.flatMap((item) =>
    itemProblems(item, names, definedVars),
  );

  if (errors.length > 0) {
    console.error(
      `registry check: ${errors.length} problem(s)\n  - ${[...new Set(errors)].join('\n  - ')}`,
    );
    process.exit(1);
  }
  console.log(
    `registry check: OK — ${items.length} items, closed graph, no leaked imports, all tokens covered`,
  );
}

main();
