import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { generatedRegistry, REGISTRY_SOURCE } from './generate.js';
import { rewrittenSource } from './source.js';

export const SHADCN = 'shadcn@4.22.0';
export type RegistryFile = {
  path: string;
  target: string;
  type: string;
  content?: string;
};
export type RegistryItem = {
  name: string;
  type: string;
  extends?: string;
  files: RegistryFile[];
  dependencies?: string[];
  registryDependencies?: string[];
  css?: Record<string, unknown>;
  meta?: Record<string, unknown>;
};
export type Registry = { items: RegistryItem[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
export function readRegistry(text: string): Registry {
  const parsed: unknown = JSON.parse(text);
  if (!isRecord(parsed) || !Array.isArray(parsed.items))
    throw new Error('Invalid registry');
  const items = parsed.items.map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item.name !== 'string' ||
      typeof item.type !== 'string' ||
      !Array.isArray(item.files)
    )
      throw new Error('Invalid registry item');
    const files = item.files.map((file: unknown) => {
      if (
        !isRecord(file) ||
        typeof file.path !== 'string' ||
        typeof file.target !== 'string' ||
        typeof file.type !== 'string'
      )
        throw new Error('Invalid registry file');
      return { path: file.path, target: file.target, type: file.type };
    });
    return { ...item, name: item.name, type: item.type, files };
  });
  return { items };
}

export function cli(args: readonly string[], cwd: string) {
  const result = Bun.spawnSync(['bunx', '--bun', SHADCN, ...args], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 180000,
  });
  const output = `${result.stdout.toString()}\n${result.stderr.toString()}`;
  if (result.exitCode !== 0)
    throw new Error(`shadcn ${args.join(' ')} failed\n${output}`);
  return output;
}

function stageFile(root: string, included: string, file: RegistryFile) {
  const target = join(included, file.path);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(join(root, file.path), target);
}

function rewriteItem(root: string, output: string, item: RegistryItem) {
  const path = join(output, `${item.name}.json`);
  const raw: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (!isRecord(raw) || !Array.isArray(raw.files))
    throw new Error(`Invalid built item ${item.name}`);
  raw.files = raw.files.map((file) => rewrittenFile(root, file));
  writeFileSync(path, `${JSON.stringify(raw, null, 2)}\n`);
}

function rewrittenFile(root: string, file: unknown) {
  if (
    !isRecord(file) ||
    typeof file.path !== 'string' ||
    typeof file.content !== 'string'
  )
    throw new Error('Missing built file content');
  const path = file.path.replace(/^tooling\/registry\/generated\//, '');
  return {
    ...file,
    path,
    content: /\.[cm]?tsx?$/.test(path)
      ? rewrittenSource(root, path, file.content)
      : file.content,
  };
}

export function buildRegistry(root: string, output: string): string {
  const staging = mkdtempSync(join(tmpdir(), 'sapphire-registry-v4-'));
  const source = generatedRegistry(root);
  const registry = readRegistry(source);
  const included = dirname(join(staging, REGISTRY_SOURCE));
  mkdirSync(included, { recursive: true });
  cpSync(join(root, 'registry.json'), join(staging, 'registry.json'));
  writeFileSync(join(staging, REGISTRY_SOURCE), source);
  for (const item of registry.items)
    for (const file of item.files) stageFile(root, included, file);
  cli(['build', 'registry.json', '--output', resolve(output)], staging);
  cli(['registry', 'validate', 'registry.json'], staging);
  for (const item of registry.items) rewriteItem(root, output, item);
  writeFileSync(
    join(output, 'registry.json'),
    `${JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry.json', name: 'sapphire-ui', homepage: 'https://design.kongmy.dev', items: registry.items }, null, 2)}\n`,
  );
  return staging;
}

if (import.meta.main) {
  const root = process.cwd();
  const output = resolve(process.env.REGISTRY_V4_OUT ?? 'dist-docs/r/v4');
  buildRegistry(root, output);
  console.log(`registry v4: built and validated ${output}`);
}
