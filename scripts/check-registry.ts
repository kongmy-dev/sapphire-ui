#!/usr/bin/env bun
/**
 * CI guard for the Sapphire product registry. Builds the registry to a temp dir
 * and asserts three invariants that keep registry items self-contained and
 * consumable:
 *
 *   1. Closed graph      — every registryDependency resolves to a known item.
 *   2. No leaked imports  — emitted files carry no library-relative imports
 *                           (`../…` / `./…`); everything is on the `@/` alias.
 *   3. Token coverage     — every Sapphire CSS var a component references
 *                           (`--color-*`, `--radius-*`, …) is defined by the
 *                           `theme` item consumers install. A miss = a silently
 *                           unstyled utility in a fresh app.
 *
 * Exits non-zero with a report on any violation.
 */
import { mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SAPPHIRE_VAR =
  /--(?:color|radius|font|text|leading|space|shadow|transition)-[a-z0-9-]+/g;

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

interface Item {
  name: string;
  type: string;
  registryDependencies?: string[];
  files: Array<{ target?: string; content: string }>;
}

function readItems(dir: string): Item[] {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'registry.json')
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Item);
}

function main() {
  const dir = buildToTemp();
  const items = readItems(dir);
  const names = new Set(items.map((i) => i.name));
  const errors: string[] = [];

  // Token set = every var declared by the theme item's shipped CSS.
  const theme = items.find((i) => i.name === 'theme');
  if (!theme) throw new Error('no theme item generated');
  const themeCss = theme.files.map((f) => f.content).join('\n');
  const definedVars = new Set(
    [...themeCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );

  for (const item of items) {
    // 1. closed graph
    for (const dep of item.registryDependencies ?? []) {
      if (!names.has(dep)) {
        errors.push(
          `${item.name}: registryDependency "${dep}" is not a registry item`,
        );
      }
    }
    // Checks 2 & 3 apply to component items — they consume tokens; the theme
    // item defines them.
    if (item.type !== 'registry:ui') continue;
    for (const file of item.files) {
      // 2. no leaked relative imports
      for (const m of file.content.matchAll(/from\s+['"](\.[^'"]*)['"]/g)) {
        errors.push(`${item.name}: leaked relative import "${m[1]}"`);
      }
      // 3. token coverage
      for (const ref of file.content.match(SAPPHIRE_VAR) ?? []) {
        if (!definedVars.has(ref)) {
          errors.push(`${item.name}: references undefined token "${ref}"`);
        }
      }
    }
  }

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
