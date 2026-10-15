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
    SCRIPT_KINDS[extname(path)] ?? ts.ScriptKind.TSX
  );

const isJsDoc = (node: ts.Node) =>
  node.kind >= ts.SyntaxKind.FirstJSDocNode && node.kind <= ts.SyntaxKind.LastJSDocNode;

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

/**
 * Checks whether a comment range is a JSDoc block directly attached to an exported
 * declaration or a member of an exported interface/type.
 */
export function isExportJsDoc(source: ts.SourceFile, range: ts.CommentRange, text: string): boolean {
  const commentText = text.slice(range.pos, range.end);
  if (!commentText.startsWith('/**')) return false;

  // Check the character immediate after range.end plus any whitespace
  const afterComment = text.slice(range.end).trimStart();

  // Allowed if directly precedes export keyword or modifiers
  if (/^export\b/.test(afterComment)) return true;

  // Or if it is a property/method signature inside an exported type/interface
  // Find AST node whose pos matches or immediately follows range.end
  let attachedNode: ts.Node | null = null;
  const findNode = (node: ts.Node) => {
    if (node.getStart(source) >= range.end && (!attachedNode || node.getStart(source) < attachedNode.getStart(source))) {
      attachedNode = node;
    }
    node.forEachChild(findNode);
  };
  findNode(source);

  if (attachedNode) {
    let parent: ts.Node | undefined = (attachedNode as ts.Node).parent;
    while (parent) {
      if (
        (ts.isInterfaceDeclaration(parent) || ts.isTypeAliasDeclaration(parent)) &&
        parent.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        return true;
      }
      parent = parent.parent;
    }
  }

  return false;
}
