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
