import { extname } from 'node:path';
import ts from 'typescript';

const SCRIPT_KINDS: Record<string, ts.ScriptKind> = {
  '.ts': ts.ScriptKind.TS,
  '.mts': ts.ScriptKind.TS,
  '.cts': ts.ScriptKind.TS,
  '.tsx': ts.ScriptKind.TSX,
  '.js': ts.ScriptKind.JS,
  '.mjs': ts.ScriptKind.JS,
  '.cjs': ts.ScriptKind.JS,
  '.jsx': ts.ScriptKind.JSX,
};

export const parseSource = (path: string, text: string): ts.SourceFile =>
  ts.createSourceFile(
    path,
    text,
    ts.ScriptTarget.Latest,
    true,
    SCRIPT_KINDS[extname(path)] ?? ts.ScriptKind.TSX,
  );

const isJsDoc = (node: ts.Node) =>
  node.kind >= ts.SyntaxKind.FirstJSDocNode &&
  node.kind <= ts.SyntaxKind.LastJSDocNode;

const startsInside = (range: ts.TextRange, spans: ts.TextRange[]) =>
  spans.some((span) => range.pos >= span.pos && range.pos < span.end);

export function commentRanges(source: ts.SourceFile): ts.CommentRange[] {
  const text = source.getFullText();
  const found = new Map<number, ts.CommentRange>();
  const jsxText: ts.TextRange[] = [];

  const collect = (ranges: ts.CommentRange[] | undefined) => {
    for (const range of ranges ?? []) found.set(range.pos, range);
  };

  const visit = (node: ts.Node): void => {
    if (isJsDoc(node)) return;
    if (ts.isJsxText(node)) jsxText.push(node);
    collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
    collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    for (const child of node.getChildren(source)) visit(child);
  };

  visit(source);
  return [...found.values()]
    .filter((range) => !startsInside(range, jsxText))
    .sort((a, b) => a.pos - b.pos);
}

const isExportedTypeDeclaration = (node: ts.Node) =>
  (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
  (node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ??
    false);

function firstNodeStartingAfter(
  source: ts.SourceFile,
  position: number,
): ts.Node | undefined {
  const candidates: ts.Node[] = [];
  const collect = (node: ts.Node) => {
    if (node.getStart(source) >= position) candidates.push(node);
    node.forEachChild(collect);
  };
  collect(source);
  return candidates.reduce<ts.Node | undefined>(
    (first, node) =>
      first === undefined || node.getStart(source) < first.getStart(source)
        ? node
        : first,
    undefined,
  );
}

function hasExportedTypeAncestor(node: ts.Node | undefined): boolean {
  for (let parent = node?.parent; parent; parent = parent.parent) {
    if (isExportedTypeDeclaration(parent)) return true;
  }
  return false;
}

export function isExportJsDoc(
  source: ts.SourceFile,
  range: ts.CommentRange,
  text: string,
): boolean {
  if (!text.slice(range.pos, range.end).startsWith('/**')) return false;
  if (/^export\b/.test(text.slice(range.end).trimStart())) return true;
  return hasExportedTypeAncestor(firstNodeStartingAfter(source, range.end));
}
