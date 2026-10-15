import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { getChangedSourceFiles } from './comments';
import { parseSource } from '../source/parse';

export type HexViolation = { file: string; line: number; hex: string };

const HEX_COLOR_REGEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

export function findHexColors(file: string, text: string): HexViolation[] {
  const violations: HexViolation[] = [];
  const source = parseSource(file, text);

  function checkString(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateHead | ts.TemplateMiddle | ts.TemplateTail) {
    const content = node.text;
    const matches = content.match(HEX_COLOR_REGEX);
    if (matches) {
      const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
      for (const hex of matches) {
        violations.push({ file, line, hex });
      }
    }
  }

  function visit(node: ts.Node) {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      checkString(node);
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return violations;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  let args = process.argv.slice(2).filter((f) => /\.(ts|tsx)$/.test(f));

  if (!args.length) {
    args = getChangedSourceFiles(root).filter((f) => f.startsWith('src/components/'));
  }

  const files = args
    .map((f) => relative(root, resolve(root, f)))
    .filter((f) => !f.startsWith('..') && existsSync(resolve(root, f)));

  if (!files.length) {
    console.log('Token gate: 0 component file(s) to check.');
    process.exit(0);
  }

  const violations = files.flatMap((file) => findHexColors(file, readFileSync(resolve(root, file), 'utf8')));

  if (!violations.length) {
    console.log(`Token gate: ${files.length} file(s) checked, zero hardcoded hex colors.`);
    process.exit(0);
  }

  console.error(`\nToken gate — ${violations.length} hardcoded hex color(s) found (P-8):\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  Found "${v.hex}". Replace with semantic token or var(--color-...).`);
  }
  process.exit(1);
}
