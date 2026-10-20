import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildStylesheet } from '../css/build';
import type { ExampleRow } from './catalog';

export async function buildExamples(options: {
  root: string;
  out: string;
  examples: readonly ExampleRow[];
}) {
  const { root, out, examples } = options;
  const files = [...new Map(examples.map((row) => [row.component, row.file]))];
  const source = [
    `import {mountExample} from ${JSON.stringify(join(root, 'tooling/examples/browser.tsx'))};`,
    ...files.map(
      ([, file], index) =>
        `import {examples as examples${index}} from ${JSON.stringify(resolve(root, file))};`,
    ),
    `mountExample({${files
      .map(([name], index) => `${JSON.stringify(name)}:examples${index}`)
      .join(',')}});`,
  ].join('\n');
  const entry = join(out, 'examples-entry.tsx');
  writeFileSync(entry, source);
  const result = await Bun.build({
    entrypoints: [entry],
    outdir: out,
    target: 'browser',
    define: { 'process.env.NODE_ENV': '"development"' },
  });
  if (!result.success)
    throw new Error(result.logs.map((log) => log.message).join('\n'));
  await buildStylesheet(root, out, { minify: true });
  const styles = files
    .map(([, file]) => resolve(root, file.replace(/\.tsx$/, '.css')))
    .filter(existsSync)
    .map((file) => readFileSync(file, 'utf8'));
  writeFileSync(join(out, 'examples.css'), styles.join('\n'));
}
