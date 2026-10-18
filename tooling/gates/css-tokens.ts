import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export type VariableViolation = {
  file: string;
  variable: string;
  issue: string;
};

const THEME_FILES = ['src/theme.css', 'src/index.css'];
const DECLARATION = /--([a-zA-Z0-9_-]+)\s*:/g;
const VARIABLE_USE = /var\((--[a-zA-Z0-9_-]+)\)/g;
const SOURCE_FILE = /\.(tsx|ts)$/;

const readIfPresent = (path: string) =>
  existsSync(path) ? readFileSync(path, 'utf8') : '';

export function getDeclaredCssVariables(root: string): Set<string> {
  return new Set(
    THEME_FILES.flatMap((rel) =>
      [...readIfPresent(resolve(root, rel)).matchAll(DECLARATION)].flatMap(
        (match) => (match[1] ? [`--${match[1]}`] : []),
      ),
    ),
  );
}

function componentSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return entry === '__tests__' ? [] : componentSourceFiles(full);
    }
    return SOURCE_FILE.test(entry) ? [full] : [];
  });
}

function undeclaredVariables(
  root: string,
  file: string,
  declared: Set<string>,
): VariableViolation[] {
  const content = readFileSync(file, 'utf8');
  return [...content.matchAll(VARIABLE_USE)]
    .flatMap((match) => match[1] ?? [])
    .filter((variable) => !declared.has(variable))
    .map((variable) => ({
      file: file.replace(`${root}/`, ''),
      variable,
      issue: `CSS variable ${variable} is used in component but not defined in src/theme.css or src/index.css.`,
    }));
}

export function checkComponentCssVariables(root: string): VariableViolation[] {
  const declared = getDeclaredCssVariables(root);
  return componentSourceFiles(resolve(root, 'src/components')).flatMap((file) =>
    undeclaredVariables(root, file, declared),
  );
}

function main() {
  const violations = checkComponentCssVariables(process.cwd());

  if (!violations.length) {
    console.log(
      'CSS token gate: OK — all CSS variables used in components are defined in theme.',
    );
    process.exit(0);
  }

  console.error(
    `\nCSS token gate — ${violations.length} undefined CSS variable(s) (P-8):\n`,
  );
  for (const v of violations) {
    console.error(`  ${v.file}: ${v.variable} — ${v.issue}`);
  }
  process.exit(1);
}

if (import.meta.main) main();
