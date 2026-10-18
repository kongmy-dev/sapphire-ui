import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type CoverageViolation = {
  routeOrComponent: string;
  issue: string;
};

export function checkA11yCoverage(root: string): CoverageViolation[] {
  const violations: CoverageViolation[] = [];
  const a11ySpecPath = resolve(root, 'tests/a11y.spec.ts');
  const a11yInteractionsPath = resolve(root, 'tests/a11y-interactions.spec.ts');

  if (!existsSync(a11ySpecPath) || !existsSync(a11yInteractionsPath)) {
    violations.push({
      routeOrComponent: 'tests/a11y*.spec.ts',
      issue: 'Accessibility test specs are missing.',
    });
    return violations;
  }

  const specContent =
    readFileSync(a11ySpecPath, 'utf8') +
    readFileSync(a11yInteractionsPath, 'utf8');

  const REQUIRED_INTERACTIVE_PRIMITIVES = [
    'Accordion',
    'Popover',
    'Sheet',
    'DropdownMenu',
    'Dialog',
  ];

  for (const primitive of REQUIRED_INTERACTIVE_PRIMITIVES) {
    if (!specContent.includes(primitive)) {
      violations.push({
        routeOrComponent: primitive,
        issue: `Interactive primitive ${primitive} must have an accessibility scenario in tests/a11y*.spec.ts.`,
      });
    }
  }

  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const violations = checkA11yCoverage(root);

  if (!violations.length) {
    console.log(
      'A11y coverage gate: OK — all required interactive primitives covered in a11y suites.',
    );
    process.exit(0);
  }

  console.error(
    `\nA11y coverage gate — ${violations.length} finding(s) (P-9):\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.routeOrComponent}: ${v.issue}`);
  }
  process.exit(1);
}
