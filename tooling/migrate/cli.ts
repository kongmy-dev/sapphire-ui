import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { migrateText } from './transform.js';

const ignored = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.astro',
  'coverage',
  'vendor',
]);
const supported = new Set([
  '.css',
  '.html',
  '.astro',
  '.jsx',
  '.tsx',
  '.js',
  '.ts',
  '.mjs',
  '.mts',
  '.cjs',
  '.cts',
]);
function files(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink() || ignored.has(entry.name)) return [];
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return files(path);
    return supported.has(extname(path)) ? [path] : [];
  });
}

function migrateFile(root: string, path: string, check: boolean) {
  const source = readFileSync(path, 'utf8');
  const result = migrateText(path, source);
  const changed = result.text !== source;
  const name = relative(root, path);
  const report = result.issues.map(
    (issue) => `${name}:${issue.line}: manual: ${issue.message}`,
  );
  if (changed) {
    if (!check) writeFileSync(path, result.text);
    report.unshift(
      `${name}: ${check ? 'would apply' : 'applied'} ${result.changes} edits`,
    );
  }
  return { changed: Number(changed), unresolved: result.issues.length, report };
}
export function migrateApp(folder: string, check: boolean) {
  const root = resolve(folder);
  if (!lstatSync(root).isDirectory())
    throw new Error('Migration target must be a directory');
  const results = files(root)
    .sort()
    .map((path) => migrateFile(root, path, check));
  return {
    changed: results.reduce((sum, result) => sum + result.changed, 0),
    unresolved: results.reduce((sum, result) => sum + result.unresolved, 0),
    report: results.flatMap((result) => result.report),
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const targets = args.filter((argument) => !argument.startsWith('--'));
  const target = targets[0];
  if (
    !target ||
    targets.length !== 1 ||
    args.some((argument) => argument.startsWith('--') && argument !== '--check')
  ) {
    console.error('Usage: bun run migrate <app> [--check]');
    process.exitCode = 1;
  } else {
    const result = migrateApp(target, args.includes('--check'));
    for (const line of result.report) console.log(line);
    console.log(
      `migration: ${result.changed} files ${args.includes('--check') ? 'would change' : 'changed'}, ${result.unresolved} manual actions`,
    );
    if (result.unresolved || (args.includes('--check') && result.changed))
      process.exitCode = 1;
  }
}
