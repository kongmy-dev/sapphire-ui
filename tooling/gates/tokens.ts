import { existsSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';
import { parseSource } from '../source/parse';
import { getChangedSourceFiles } from './comments';

export type HexViolation = { file: string; line: number; hex: string };

type StringNode =
  | ts.StringLiteral
  | ts.NoSubstitutionTemplateLiteral
  | ts.TemplateHead
  | ts.TemplateMiddle
  | ts.TemplateTail;

const HEX_COLOR_REGEX =
  /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;

const isStringNode = (node: ts.Node): node is StringNode =>
  ts.isStringLiteral(node) ||
  ts.isNoSubstitutionTemplateLiteral(node) ||
  ts.isTemplateHead(node) ||
  ts.isTemplateMiddle(node) ||
  ts.isTemplateTail(node);

function collectStringNodes(node: ts.Node, into: StringNode[]): StringNode[] {
  if (isStringNode(node)) into.push(node);
  ts.forEachChild(node, (child) => {
    collectStringNodes(child, into);
  });
  return into;
}

export function findHexColors(file: string, text: string): HexViolation[] {
  const source = parseSource(file, text);
  return collectStringNodes(source, []).flatMap((node) => {
    const line =
      source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
    return (node.text.match(HEX_COLOR_REGEX) ?? []).map((hex) => ({
      file,
      line,
      hex,
    }));
  });
}

function componentFilesToCheck(root: string): string[] {
  const named = process.argv.slice(2).filter((f) => /\.(ts|tsx)$/.test(f));
  const candidates = named.length
    ? named
    : getChangedSourceFiles(root).filter((f) =>
        f.startsWith('src/components/'),
      );
  return candidates
    .map((f) => relative(root, resolve(root, f)))
    .filter((f) => !f.startsWith('..') && existsSync(resolve(root, f)));
}

function main() {
  const root = process.cwd();
  const files = componentFilesToCheck(root);

  if (!files.length) {
    console.log('Token gate: 0 component file(s) to check.');
    process.exit(0);
  }

  const violations = files.flatMap((file) =>
    findHexColors(file, readFileSync(resolve(root, file), 'utf8')),
  );

  if (!violations.length) {
    console.log(
      `Token gate: ${files.length} file(s) checked, zero hardcoded hex colors.`,
    );
    process.exit(0);
  }

  console.error(
    `\nToken gate — ${violations.length} hardcoded hex color(s) found (P-8):\n`,
  );
  for (const v of violations) {
    console.error(
      `  ${v.file}:${v.line}  Found "${v.hex}". Replace with semantic token or var(--color-...).`,
    );
  }
  process.exit(1);
}

if (import.meta.main) main();
