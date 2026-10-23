import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sourceImports } from '../source/imports.js';
import { readRegistry, registryOutput } from './build.js';
import { generatedRegistry, REGISTRY_SOURCE } from './generate.js';
import { registryEntries } from './source.js';

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const npmName = (specifier: string) =>
  specifier
    .split('/')
    .slice(0, specifier.startsWith('@') ? 2 : 1)
    .join('/');
function importProblems(
  path: string,
  content: string,
  dependencies: unknown[],
) {
  return sourceImports(path, content).flatMap(({ specifier }) => {
    if (!specifier || specifier.startsWith('.') || specifier.includes('/src/'))
      return [`${path}: unresolved vendored import ${specifier}`];
    if (specifier.startsWith('@/')) return [];
    if (
      dependencies.some(
        (dependency) =>
          typeof dependency === 'string' &&
          dependency.startsWith(`${npmName(specifier)}@`),
      )
    )
      return [];
    return [`${path}: undeclared dependency ${specifier}`];
  });
}
function fileProblems(file: unknown, dependencies: unknown[]): string[] {
  if (
    !record(file) ||
    typeof file.content !== 'string' ||
    typeof file.path !== 'string'
  )
    return ['Missing file content'];
  if (!/\.[cm]?tsx?$/.test(file.path)) return [];
  return importProblems(file.path, file.content, dependencies);
}
export function checkItem(text: string): string[] {
  const item: unknown = JSON.parse(text);
  if (!record(item) || !Array.isArray(item.files)) return ['Missing files'];
  const dependencies: unknown[] = Array.isArray(item.dependencies)
    ? item.dependencies
    : [];
  const failures = dependencies.flatMap((dependency) =>
    typeof dependency === 'string' &&
    /@\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(dependency)
      ? []
      : [`Unpinned dependency ${String(dependency)}`],
  );
  return [
    ...failures,
    ...item.files.flatMap((file) => fileProblems(file, dependencies)),
  ];
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
  const failures = checkRegistry(process.cwd(), registryOutput(process.env));
  for (const failure of failures) console.error(failure);
  if (failures.length) process.exitCode = 1;
  else console.log(`registry: ${registryEntries.length + 1} items checked`);
}
