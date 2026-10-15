import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type DepViolation = {
  field: string;
  pkg: string;
  issue: string;
};

export function validateDependencies(packageJson: Record<string, any>): DepViolation[] {
  const violations: DepViolation[] = [];
  const deps = packageJson.dependencies ?? {};
  const peers = packageJson.peerDependencies ?? {};
  const peerMeta = packageJson.peerDependenciesMeta ?? {};

  // 1. Peer dependencies must never leak into runtime dependencies
  for (const pkg of Object.keys(deps)) {
    if (pkg.startsWith('@radix-ui/') || pkg === 'react' || pkg === 'react-dom' || pkg === 'react-resizable-panels') {
      violations.push({
        field: 'dependencies',
        pkg,
        issue: 'Must remain in peerDependencies; never add runtime peer to dependencies.',
      });
    }
  }

  // 2. React must be in peerDependencies
  if (!peers.react || !peers['react-dom']) {
    violations.push({
      field: 'peerDependencies',
      pkg: 'react/react-dom',
      issue: 'react and react-dom must be declared in peerDependencies.',
    });
  }

  // 3. Optional peers must be declared in peerDependenciesMeta
  if (peers['react-resizable-panels'] && (!peerMeta['react-resizable-panels'] || !peerMeta['react-resizable-panels'].optional)) {
    violations.push({
      field: 'peerDependenciesMeta',
      pkg: 'react-resizable-panels',
      issue: 'react-resizable-panels must be marked optional in peerDependenciesMeta.',
    });
  }

  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const pkgPath = resolve(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  const violations = validateDependencies(pkg);

  if (!violations.length) {
    console.log('Dependency gate: OK — peer dependencies and dependency policies satisfied.');
    process.exit(0);
  }

  console.error(`\nDependency gate — ${violations.length} violation(s) found (P-10):\n`);
  for (const v of violations) {
    console.error(`  [${v.field}] ${v.pkg}: ${v.issue}`);
  }
  process.exit(1);
}
