import { expect, it } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import { devDependencies } from '../../package.json';
import { registryOutput } from './build.js';

it('isolates the current registry route and honors only its current output variable', () => {
  expect(registryOutput({})).toBe(resolve('dist-docs/r/v5'));
  expect(registryOutput({ REGISTRY_V4_OUT: 'dist-docs/r/v4' })).toBe(
    resolve('dist-docs/r/v5'),
  );
  expect(registryOutput({ REGISTRY_V5_OUT: 'coverage/custom-registry' })).toBe(
    resolve('coverage/custom-registry'),
  );
});

it('uses the installed patched CLI from a consumer directory without bunx', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'sapphire-cli-consumer-'));
  const bin = join(cwd, 'bin');
  mkdirSync(bin);
  writeFileSync(join(bin, 'bunx'), '#!/bin/sh\nexit 99\n', { mode: 0o755 });
  try {
    const source = `import { cli } from ${JSON.stringify(new URL('./build.ts', import.meta.url).href)};
console.log(cli(['--version'], process.cwd()));`;
    const result = Bun.spawnSync([process.execPath, '--eval', source], {
      cwd,
      env: {
        ...process.env,
        PATH: `${bin}${delimiter}${process.env.PATH ?? ''}`,
      },
      stdout: 'pipe',
      stderr: 'pipe',
      timeout: 10000,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stderr.toString()).toBe('');
    expect(result.stdout.toString().trim()).toBe(devDependencies.shadcn);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
