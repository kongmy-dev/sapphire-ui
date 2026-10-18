import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { cognitiveComplexity } from './cognitive';

export type FileMetrics = {
  path: string;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  maxNesting: number;
  functions: {
    name: string;
    line: number;
    cognitive: number;
    ownCognitive: number;
    codeLines: number;
  }[];
  exports: string[];
  typeDecls: number;
  interfaceDecls: number;
  isTest: boolean;
};

const isTestPath = (p: string) =>
  /\.(test|spec)\.tsx?$/.test(p) || /(^|\/)(test|__tests__)\//.test(p);

function functionName(node: ts.Node, sf: ts.SourceFile): string {
  const named = node as ts.FunctionLikeDeclaration;
  if (named.name && ts.isIdentifier(named.name)) return named.name.text;
  if (
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  )
    return node.parent.name.text;
  if (ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name))
    return node.parent.name.text;
  return `<anonymous@${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}>`;
}

type LineKind = 'code' | 'comment' | 'blank';
type Span = { start: number; end: number };

function commentSpans(sf: ts.SourceFile, text: string): Span[] {
  const spans: Span[] = [];
  const scanner = ts.createScanner(
    ts.ScriptTarget.Latest,
    false,
    ts.LanguageVariant.JSX,
    text,
  );
  for (
    let token = scanner.scan();
    token !== ts.SyntaxKind.EndOfFileToken;
    token = scanner.scan()
  ) {
    const isComment =
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia;
    if (isComment) {
      spans.push({
        start: scanner.getTokenStart(),
        end: scanner.getTokenEnd(),
      });
    }
  }
  const addLeading = (position: number) => {
    for (const r of ts.getLeadingCommentRanges(text, position) ?? []) {
      spans.push({ start: r.pos, end: r.end });
    }
  };
  const visit = (node: ts.Node) => {
    addLeading(node.getFullStart());
    ts.forEachChild(node, visit);
  };
  addLeading(0);
  visit(sf);
  return spans;
}

function markCommentLines(
  kinds: LineKind[],
  lines: string[],
  sf: ts.SourceFile,
  span: Span,
): void {
  const from = sf.getLineAndCharacterOfPosition(span.start);
  const to = sf.getLineAndCharacterOfPosition(
    Math.max(span.end - 1, span.start),
  );
  for (let i = from.line; i <= to.line; i++) {
    const hasCodeBefore = Boolean(lines[i]?.slice(0, from.character).trim());
    if (i === from.line && hasCodeBefore) continue;
    kinds[i] = 'comment';
  }
}

function lineKinds(sf: ts.SourceFile, text: string) {
  const lines = text.split('\n');
  const kinds = lines.map((line): LineKind => (line.trim() ? 'code' : 'blank'));
  for (const span of commentSpans(sf, text)) {
    markCommentLines(kinds, lines, sf, span);
  }
  const count = (kind: LineKind) => kinds.filter((k) => k === kind).length;
  return {
    codeLines: count('code'),
    commentLines: count('comment'),
    blankLines: count('blank'),
  };
}

type FunctionNode =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration;

const isFunctionNode = (node: ts.Node): node is FunctionNode =>
  ts.isFunctionDeclaration(node) ||
  ts.isFunctionExpression(node) ||
  ts.isArrowFunction(node) ||
  ts.isMethodDeclaration(node);

type NamedDeclaration =
  | ts.FunctionDeclaration
  | ts.ClassDeclaration
  | ts.InterfaceDeclaration
  | ts.TypeAliasDeclaration
  | ts.EnumDeclaration;

const isNamedDeclaration = (node: ts.Node): node is NamedDeclaration =>
  ts.isFunctionDeclaration(node) ||
  ts.isClassDeclaration(node) ||
  ts.isInterfaceDeclaration(node) ||
  ts.isTypeAliasDeclaration(node) ||
  ts.isEnumDeclaration(node);

const isExported = (node: ts.Node) =>
  !!(
    ts.getCombinedModifierFlags(node as ts.Declaration) &
    ts.ModifierFlags.Export
  );

function exportedNames(node: ts.Node): string[] {
  if (ts.isVariableStatement(node)) {
    if (!isExported(node)) return [];
    return node.declarationList.declarations.flatMap((d) =>
      ts.isIdentifier(d.name) ? [d.name.text] : [],
    );
  }
  if (isNamedDeclaration(node) && node.name && isExported(node)) {
    return [node.name.text];
  }
  return [];
}

function functionMetrics(
  node: FunctionNode,
  sf: ts.SourceFile,
): FileMetrics['functions'][number] {
  const start = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
  return {
    name: functionName(node, sf),
    line: start,
    cognitive: cognitiveComplexity(node),
    ownCognitive: cognitiveComplexity(node, true),
    codeLines: end - start + 1,
  };
}

const nestsDepth = (node: ts.Node) =>
  ts.isBlock(node) ||
  ts.isIfStatement(node) ||
  ts.isForStatement(node) ||
  ts.isForOfStatement(node) ||
  ts.isForInStatement(node) ||
  ts.isWhileStatement(node) ||
  ts.isSwitchStatement(node) ||
  ts.isTryStatement(node);

export const measureFile = (root: string, rel: string): FileMetrics =>
  measureText(rel, readFileSync(resolve(root, rel), 'utf8'));

export function measureText(rel: string, text: string): FileMetrics {
  const sf = ts.createSourceFile(
    rel,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const { codeLines, commentLines, blankLines } = lineKinds(sf, text);

  const functions: FileMetrics['functions'] = [];
  const exports: string[] = [];
  let typeDecls = 0;
  let interfaceDecls = 0;
  let maxNesting = 0;

  const visit = (node: ts.Node, depth: number) => {
    maxNesting = Math.max(maxNesting, depth);
    exports.push(...exportedNames(node));
    if (ts.isInterfaceDeclaration(node)) interfaceDecls++;
    if (ts.isTypeAliasDeclaration(node)) typeDecls++;
    if (isFunctionNode(node)) functions.push(functionMetrics(node, sf));
    const childDepth = nestsDepth(node) ? depth + 1 : depth;
    ts.forEachChild(node, (child) => {
      visit(child, childDepth);
    });
  };
  ts.forEachChild(sf, (child) => {
    visit(child, 0);
  });

  return {
    path: rel,
    codeLines,
    commentLines,
    blankLines,
    maxNesting,
    functions,
    exports,
    typeDecls,
    interfaceDecls,
    isTest: isTestPath(rel),
  };
}
