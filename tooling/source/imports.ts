import ts from 'typescript';
import { parseSource } from './parse';

export type ImportEdge = { specifier: string | null; line: number };

const isLoader = (node: ts.CallExpression) =>
  node.expression.kind === ts.SyntaxKind.ImportKeyword ||
  (ts.isIdentifier(node.expression) && node.expression.text === 'require');

function typedImportArgument(node: ts.Node): ts.Node | undefined {
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
    return node.argument.literal;
  if (
    ts.isImportEqualsDeclaration(node) &&
    ts.isExternalModuleReference(node.moduleReference)
  )
    return node.moduleReference.expression;
  return undefined;
}

function importArgument(node: ts.Node): ts.Node | null | undefined {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
    return node.moduleSpecifier;
  if (ts.isCallExpression(node) && isLoader(node))
    return node.arguments[0] ?? null;
  return typedImportArgument(node);
}

export function sourceImports(file: string, text: string): ImportEdge[] {
  const source = parseSource(file, text);
  const edges: ImportEdge[] = [];
  const visit = (node: ts.Node): void => {
    const argument = importArgument(node);
    if (argument !== undefined) {
      const specifier =
        argument !== null && ts.isStringLiteralLike(argument)
          ? argument.text
          : null;
      edges.push({
        specifier,
        line:
          source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return edges;
}
