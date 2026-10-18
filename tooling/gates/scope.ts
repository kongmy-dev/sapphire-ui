import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export type FileText = { name: string; text: string };

const FROZEN_LANE = [
  'src/',
  'registry/blocks/',
  'tests/registry-consumer/app/',
  'design/',
] as const;

export const isInScope = (name: string) =>
  !FROZEN_LANE.some((prefix) => name.startsWith(prefix));

const hasExtension = (name: string, extensions: readonly string[]) =>
  extensions.some((extension) => name.endsWith(extension));

const trackedFiles = (root: string) =>
  execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter((name) => name.length > 0);

export function loadFiles(
  root: string,
  args: readonly string[],
  extensions: readonly string[],
): FileText[] {
  const candidates =
    args.length > 0
      ? args.map((arg) => relative(root, resolve(root, arg)))
      : trackedFiles(root);
  return candidates
    .filter((name) => !name.startsWith('..'))
    .filter(isInScope)
    .filter((name) => hasExtension(name, extensions))
    .filter((name) => existsSync(resolve(root, name)))
    .map((name) => ({ name, text: readFileSync(resolve(root, name), 'utf8') }));
}
