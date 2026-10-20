import { existsSync, mkdirSync, mkdtempSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { buildPackageStyles } from './styles.js';

export async function buildPackage(root: string) {
  const cache = join(root, 'node_modules/.cache/sapphire-package');
  mkdirSync(cache, { recursive: true });
  const scratch = mkdtempSync(join(cache, 'build-'));
  const output = join(scratch, 'output');
  const child = Bun.spawn(
    [
      process.execPath,
      'x',
      '--no-install',
      'tsc',
      '-p',
      join(root, 'tsconfig.package.json'),
      '--outDir',
      output,
    ],
    { cwd: root, stdout: 'inherit', stderr: 'inherit' },
  );
  if ((await child.exited) !== 0)
    throw new Error('Package TypeScript compilation failed');
  await buildPackageStyles(root, output);
  const target = join(root, 'dist');
  if (existsSync(target)) renameSync(target, join(scratch, 'previous'));
  renameSync(output, target);
  return target;
}

if (import.meta.main) await buildPackage(process.cwd());
