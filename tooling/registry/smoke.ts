import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildRegistry, cli } from './build.js';
import { checkRegistry } from './check.js';
import { consumerSource, writeConsumer } from './consumer.js';

function command(args: string[], cwd: string) {
  const child = Bun.spawnSync(args, {
    cwd,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 180000,
  });
  if (child.exitCode !== 0)
    throw new Error(
      `${args.join(' ')}\n${child.stdout.toString()}\n${child.stderr.toString()}`,
    );
}

function configure(app: string, url: string) {
  const path = join(app, 'components.json');
  const config: unknown = JSON.parse(readFileSync(path, 'utf8'));
  if (typeof config !== 'object' || config === null)
    throw new Error('Missing CLI configuration');
  writeFileSync(
    path,
    `${JSON.stringify({ ...config, registries: { '@sapphire': url } }, null, 2)}\n`,
  );
}

export async function smokeRegistry(
  root: string,
  tarball: string,
  deployed?: string,
) {
  const directory = mkdtempSync(join(tmpdir(), 'sapphire-v4-smoke-'));
  const output = join(directory, 'r');
  buildRegistry(root, output);
  const failures = checkRegistry(root, output);
  if (failures.length) throw new Error(failures.join('\n'));
  const serverSource = join(directory, 'serve.ts');
  writeFileSync(
    serverSource,
    `const server = Bun.serve({port:0,async fetch(request){const name=new URL(request.url).pathname.split('/').pop();const file=Bun.file(${JSON.stringify(output)}+'/'+name);return await file.exists()?new Response(file,{headers:{'content-type':'application/json'}}):new Response('missing',{status:404});}});console.log(server.url.href);`,
  );
  const server = Bun.spawn(['bun', serverSource], {
    stdout: 'pipe',
    stderr: 'inherit',
  });
  const reader = server.stdout.getReader();
  const first = await reader.read();
  const address = new TextDecoder().decode(first.value).trim();
  const url = deployed ?? `${address}{name}.json`;
  const app = join(directory, 'app');
  try {
    writeConsumer(root, app, tarball);
    command(['bun', 'install', '--ignore-scripts'], app);
    console.log(
      cli(
        [
          'init',
          `${url.replace('{name}', 'base')}`,
          '--yes',
          '--force',
          '--no-monorepo',
        ],
        app,
      ),
    );
    configure(app, url);
    console.log(
      cli(
        [
          'add',
          '@sapphire/button',
          '@sapphire/dialog',
          '@sapphire/sidebar',
          '--yes',
          '--overwrite',
        ],
        app,
      ),
    );
    writeFileSync(join(app, 'src/main.tsx'), consumerSource());
    command(['bunx', 'tsc', '--noEmit'], app);
    command(['bunx', 'vite', 'build'], app);
    console.log(`registry v4 smoke: installed and built ${app}`);
    return app;
  } finally {
    server.kill();
  }
}

if (import.meta.main) {
  const tarball = process.env.SAPPHIRE_PACKAGE_TARBALL;
  if (!tarball)
    throw new Error('Set SAPPHIRE_PACKAGE_TARBALL to the packed v4 package');
  await smokeRegistry(
    process.cwd(),
    tarball,
    process.env.SAPPHIRE_REGISTRY_URL,
  );
}
