import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type ExternalViolation = {
  path: string;
  issue: string;
};

export function checkBundleExternals(root: string): ExternalViolation[] {
  const violations: ExternalViolation[] = [];
  const distNodeModules = resolve(root, 'dist/node_modules');

  if (existsSync(distNodeModules)) {
    violations.push({
      path: 'dist/node_modules',
      issue: 'Peer dependency leaked into build output! Ensure all peers are listed in vite.config.ts rollupOptions.external.',
    });
  }

  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const violations = checkBundleExternals(root);

  if (!violations.length) {
    console.log('Bundle externals gate: OK — zero peer dependencies leaked into dist/.');
    process.exit(0);
  }

  console.error(`\nBundle externals gate — ${violations.length} leak(s) found:\n`);
  for (const v of violations) {
    console.error(`  ${v.path}: ${v.issue}`);
  }
  process.exit(1);
}
