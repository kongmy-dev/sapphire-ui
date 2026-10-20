import { expect, it } from 'bun:test';

it('imports element modules and examples on a server without touching browser globals', async () => {
  const files = ['banner', 'site-header', 'site-footer'];
  const imports = files.flatMap((name) => [
    new URL(`./${name}.ts`, import.meta.url).href,
    new URL(`./${name}.examples.ts`, import.meta.url).href,
  ]);
  const source = `const modules = await Promise.all(${JSON.stringify(imports)}.map(path => import(path))); if (modules.some(module => Object.entries(module).some(([key, value]) => key.endsWith('Element') && value !== undefined))) process.exit(1);`;
  const child = Bun.spawn([process.execPath, '-e', source], {
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const error = await new Response(child.stderr).text();
  expect(error).toBe('');
  expect(await child.exited).toBe(0);
});
