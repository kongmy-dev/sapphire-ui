import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { snapshot } from './snapshot';

function main() {
  const root = process.cwd();
  const out = process.argv[2];
  const snap = snapshot(root);
  if (out) {
    writeFileSync(resolve(root, out), `${JSON.stringify(snap, null, 2)}\n`);
    console.log(`wrote ${relative(root, resolve(root, out))}`);
  }
  console.log(JSON.stringify(snap.totals, null, 2));
}

if (import.meta.main) main();
