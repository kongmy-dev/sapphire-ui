#!/usr/bin/env bun
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const FIXTURE = 'tests/registry-consumer';
const APP = join(FIXTURE, 'app');

interface Item {
  name: string;
  files: Array<{ target?: string; content: string }>;
}

type VendoredFile = { target: string; content: string };

function hasTarget(file: Item['files'][number]): file is VendoredFile {
  return typeof file.target === 'string' && file.target !== '';
}

function run(cmd: string[]): void {
  const proc = Bun.spawnSync(cmd, { stdout: 'pipe', stderr: 'pipe' });
  if (proc.exitCode !== 0) {
    console.error(proc.stdout.toString());
    console.error(proc.stderr.toString());
    throw new Error(`command failed: ${cmd.join(' ')}`);
  }
}

function buildRegistry(): string {
  const out = mkdtempSync(join(tmpdir(), 'sapphire-registry-'));
  const build = Bun.spawnSync(['bun', 'scripts/build-registry.ts'], {
    env: { ...process.env, REGISTRY_OUT: out },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  if (build.exitCode !== 0) {
    console.error(build.stderr.toString());
    throw new Error('build-registry failed');
  }
  return out;
}

function removeStaleVendoredFilesSoDeletionsSurface(): void {
  rmSync(join(APP, 'components'), { recursive: true, force: true });
  rmSync(join(APP, 'styles'), { recursive: true, force: true });
}

function materialize(): void {
  const out = buildRegistry();
  removeStaleVendoredFilesSoDeletionsSurface();

  const items = readdirSync(out)
    .filter((f) => f.endsWith('.json') && f !== 'registry.json')
    .map((f) => JSON.parse(readFileSync(join(out, f), 'utf8')) as Item);
  const files = items.flatMap((item) => item.files).filter(hasTarget);

  for (const file of files) {
    const dest = join(APP, file.target);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, file.content);
  }
  console.log(
    `consumer: materialized ${files.length} files from ${items.length} items`,
  );
}

function assertBuiltCss(): void {
  const assetsDir = join(FIXTURE, 'dist', 'assets');
  const css = readdirSync(assetsDir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(join(assetsDir, f), 'utf8'))
    .join('\n');
  const checks: Array<[string, boolean]> = [
    ['navy token #0a192f (bg-primary)', css.includes('#0a192f')],
    ['surface token #f4f6f8 (bg-background alias)', css.includes('#f4f6f8')],
    [
      'muted token #475569 (text-muted-foreground alias)',
      css.includes('#475569'),
    ],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([label]) => label);
  if (missing.length > 0) {
    throw new Error(`compiled CSS missing tokens: ${missing.join(', ')}`);
  }
  console.log(
    'consumer: compiled CSS contains Sapphire tokens + shadcn aliases',
  );
}

function main(): void {
  materialize();
  run(['bunx', 'tsc', '--noEmit', '-p', join(FIXTURE, 'tsconfig.json')]);
  console.log('consumer: tsc --noEmit OK (all vendored components type-check)');
  run(['bunx', 'vite', 'build', '-c', join(FIXTURE, 'vite.config.ts')]);
  assertBuiltCss();
  console.log(
    'consumer: OK — registry vendors, type-checks, and renders with tokens',
  );
}

main();
