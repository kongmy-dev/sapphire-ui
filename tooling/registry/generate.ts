import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  collectItem,
  exactDependencies,
  registryEntries,
  registryFile,
} from './source.js';

export const REGISTRY_SOURCE = 'tooling/registry/generated/registry.json';
export function generatedRegistry(root: string): string {
  const pkg: unknown = JSON.parse(
    readFileSync(resolve(root, 'package.json'), 'utf8'),
  );
  const version =
    typeof pkg === 'object' && pkg !== null && 'version' in pkg
      ? pkg.version
      : undefined;
  if (typeof version !== 'string') throw new Error('Missing package version');
  const foundations = `^${version}`;
  const items: {
    name: string;
    type: string;
    files: { path: string; type: string; target: string }[];
    dependencies: string[];
    registryDependencies: string[];
    css?: Record<string, Record<string, string>>;
    meta: { foundations: string; cssOwner: string };
    extends?: string;
  }[] = registryEntries.map((item) => {
    const collected = collectItem(root, item.entry);
    const owner = item.entry.split('/').slice(0, 2).join('/');
    const css = `${owner}/${owner.split('/')[1]}.css`;
    const hasCss = existsSync(resolve(root, css));
    const files = collected.files.map(registryFile);
    if (hasCss)
      files.push({
        path: css,
        type: 'registry:file',
        target: `@ui/${item.name}.css`,
      });
    return {
      ...item,
      entry: undefined,
      files,
      dependencies: exactDependencies(root, collected.dependencies),
      registryDependencies: collected.registryDependencies,
      ...(hasCss
        ? { css: { [`@import "@/components/ui/${item.name}.css"`]: {} } }
        : {}),
      meta: { foundations, cssOwner: item.name },
    };
  });
  items.unshift({
    name: 'base',
    type: 'registry:base',
    files: [
      {
        path: 'skills/sapphire/SKILL.md',
        type: 'registry:file',
        target: '~/.claude/skills/sapphire/SKILL.md',
      },
    ],
    dependencies: [`@kongmy-dev/sapphire-ui@${version}`],
    registryDependencies: [],
    css: { '@import "@kongmy-dev/sapphire-ui/foundations.css"': {} },
    meta: { foundations, cssOwner: 'foundations' },
    extends: 'none',
  });
  const json = `${JSON.stringify({ $schema: 'https://ui.shadcn.com/schema/registry.json', items }, null, 2)}\n`;
  const formatted = Bun.spawnSync(
    ['bunx', 'biome', 'format', '--stdin-file-path=registry.json'],
    { cwd: root, stdin: Buffer.from(json), stdout: 'pipe', stderr: 'pipe' },
  );
  if (formatted.exitCode !== 0) throw new Error(formatted.stderr.toString());
  return formatted.stdout.toString();
}

if (import.meta.main) {
  const root = process.cwd();
  mkdirSync(dirname(resolve(root, REGISTRY_SOURCE)), { recursive: true });
  writeFileSync(resolve(root, REGISTRY_SOURCE), generatedRegistry(root));
}
