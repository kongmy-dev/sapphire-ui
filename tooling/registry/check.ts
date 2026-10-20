import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceImports } from '../source/imports.js';
import { readRegistry } from './build.js';
import { generatedRegistry, REGISTRY_SOURCE } from './generate.js';
import { registryEntries } from './source.js';

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function checkItem(text: string): string[] {
  const item: unknown = JSON.parse(text);
  if (!record(item) || !Array.isArray(item.files)) return ['Missing files'];
  const failures: string[] = [];
  const dependencies = Array.isArray(item.dependencies)
    ? item.dependencies
    : [];
  for (const dependency of dependencies)
    if (
      typeof dependency !== 'string' ||
      !/@\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(dependency)
    )
      failures.push(`Unpinned dependency ${String(dependency)}`);
  for (const file of item.files) {
    if (
      !record(file) ||
      typeof file.content !== 'string' ||
      typeof file.path !== 'string'
    ) {
      failures.push('Missing file content');
      continue;
    }
    if (!/\.[cm]?tsx?$/.test(file.path)) continue;
    for (const edge of sourceImports(file.path, file.content)) {
      const specifier = edge.specifier;
      if (
        !specifier ||
        specifier.startsWith('.') ||
        specifier.includes('/src/')
      )
        failures.push(`${file.path}: unresolved vendored import ${specifier}`);
      else if (
        !specifier.startsWith('@/') &&
        !dependencies.some(
          (dependency) =>
            typeof dependency === 'string' &&
            dependency.startsWith(
              `${specifier
                .split('/')
                .slice(0, specifier.startsWith('@') ? 2 : 1)
                .join('/')}@`,
            ),
        )
      )
        failures.push(`${file.path}: undeclared dependency ${specifier}`);
    }
  }
  return failures;
}

export function checkRegistry(root: string, output: string): string[] {
  const failures: string[] = [];
  if (
    readFileSync(join(root, REGISTRY_SOURCE), 'utf8') !==
    generatedRegistry(root)
  )
    failures.push(`${REGISTRY_SOURCE}: stale generated source`);
  const registry = readRegistry(
    readFileSync(join(output, 'registry.json'), 'utf8'),
  );
  const expected = [
    'base',
    ...registryEntries.map((entry) => entry.name),
  ].sort();
  if (
    JSON.stringify(registry.items.map((item) => item.name).sort()) !==
    JSON.stringify(expected)
  )
    failures.push('Registry item inventory differs');
  for (const item of registry.items)
    failures.push(
      ...checkItem(readFileSync(join(output, `${item.name}.json`), 'utf8')).map(
        (failure) => `${item.name}: ${failure}`,
      ),
    );
  return failures;
}

if (import.meta.main) {
  const failures = checkRegistry(
    process.cwd(),
    process.env.REGISTRY_V4_OUT ?? 'dist-docs/r/v4',
  );
  for (const failure of failures) console.error(failure);
  if (failures.length) process.exitCode = 1;
  else console.log(`registry v4: ${registryEntries.length + 1} items checked`);
}
