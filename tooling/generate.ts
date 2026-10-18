import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { GENERATORS } from './generators';

const root = process.cwd();
for (const { file, generate } of GENERATORS) {
  writeFileSync(join(root, file), generate(root));
  console.log(`generate: wrote ${file}`);
}
