import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type ExampleRow, namesFromSource } from './catalog';

export function readElementExamples(root: string): ExampleRow[] {
  const directory = join(root, 'elements');
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => /^[a-z][a-z0-9-]*\.examples\.ts$/.test(name))
    .sort()
    .flatMap((name) => {
      const file = `elements/${name}`;
      return namesFromSource(file, readFileSync(join(root, file), 'utf8')).map(
        (example) => ({
          component: name.replace('.examples.ts', ''),
          file,
          name: example,
        }),
      );
    });
}
