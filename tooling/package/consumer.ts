import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export async function consumerCommand(cwd: string, args: readonly string[]) {
  const child = Bun.spawn([process.execPath, ...args], {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);
  if (code !== 0)
    throw new Error(`${args.join(' ')} failed in ${cwd}\n${stdout}\n${stderr}`);
  return stdout.trim();
}

export async function packPackage(root: string, scratch: string) {
  const tarball = join(scratch, 'sapphire-ui.tgz');
  await consumerCommand(root, [
    'pm',
    'pack',
    '--ignore-scripts',
    '--filename',
    tarball,
    '--quiet',
  ]);
  return tarball;
}

export async function installConsumer(input: {
  scratch: string;
  name: string;
  tarball: string;
  dependencies?: Readonly<Record<string, string>>;
}) {
  const cwd = join(input.scratch, input.name);
  mkdirSync(cwd);
  writeFileSync(
    join(cwd, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: {
        '@kongmy-dev/sapphire-ui': `file:${input.tarball}`,
        ...input.dependencies,
      },
    }),
  );
  await consumerCommand(cwd, ['install', '--ignore-scripts']);
  return cwd;
}

export function requireNoPeers(cwd: string, peers: readonly string[]) {
  for (const peer of peers)
    if (existsSync(join(cwd, 'node_modules', peer, 'package.json')))
      throw new Error(`Unexpected peer ${peer} in ${cwd}`);
}

export async function runConsumer(cwd: string, source: string) {
  writeFileSync(join(cwd, 'smoke.js'), source);
  await consumerCommand(cwd, ['run', './smoke.js']);
}
