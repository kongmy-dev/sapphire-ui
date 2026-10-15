import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type VariableViolation = {
  file: string;
  variable: string;
  issue: string;
};

export function getDeclaredCssVariables(root: string): Set<string> {
  const vars = new Set<string>();
  const themeFiles = ['src/theme.css', 'src/index.css'];

  for (const rel of themeFiles) {
    const fullPath = resolve(root, rel);
    try {
      const content = readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/--([a-zA-Z0-9_-]+)\s*:/g);
      for (const m of matches) {
        if (m[1]) vars.add(`--${m[1]}`);
      }
    } catch {
      // ignore
    }
  }

  return vars;
}

export function checkComponentCssVariables(root: string): VariableViolation[] {
  const violations: VariableViolation[] = [];
  const declared = getDeclaredCssVariables(root);
  const componentsDir = resolve(root, 'src/components');

  function scanDir(dir: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry !== '__tests__') scanDir(full);
      } else if (/\.(tsx|ts)$/.test(entry)) {
        const content = readFileSync(full, 'utf8');
        const matches = content.matchAll(/var\((--[a-zA-Z0-9_-]+)\)/g);
        for (const m of matches) {
          const varName = m[1];
          if (varName && !declared.has(varName)) {
            violations.push({
              file: full.replace(`${root}/`, ''),
              variable: varName,
              issue: `CSS variable ${varName} is used in component but not defined in src/theme.css or src/index.css.`,
            });
          }
        }
      }
    }
  }

  scanDir(componentsDir);
  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const violations = checkComponentCssVariables(root);

  if (!violations.length) {
    console.log('CSS token gate: OK — all CSS variables used in components are defined in theme.');
    process.exit(0);
  }

  console.error(`\nCSS token gate — ${violations.length} undefined CSS variable(s) (P-8):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.variable} — ${v.issue}`);
  }
  process.exit(1);
}
