import ts from 'typescript';
import { parseSource } from '../source/parse.js';
import {
  componentImports,
  isSapphire,
  migrateImport,
  migrateProps,
} from './api.js';
import { type Attribute, migrateAttributes } from './attributes.js';
import { issueAt, type Migration } from './result.js';
import { removeShadowed, validScript } from './syntax.js';

function literalOf(attribute: ts.JsxAttribute) {
  const initializer = attribute.initializer;
  let literal: ts.StringLiteralLike | undefined;
  if (initializer && ts.isStringLiteral(initializer)) literal = initializer;
  if (
    initializer &&
    ts.isJsxExpression(initializer) &&
    initializer.expression &&
    ts.isStringLiteralLike(initializer.expression)
  )
    literal = initializer.expression;
  return literal;
}
function jsxAttribute(attribute: ts.JsxAttribute): Attribute {
  const literal = literalOf(attribute);
  const raw = literal?.getText() ?? '';
  return {
    name: attribute.name.getText(),
    start: attribute.getStart(),
    end: attribute.getEnd(),
    value: raw.includes('\\') ? null : (literal?.text ?? null),
    valueStart: literal ? literal.getStart() + 1 : attribute.getStart(),
    valueEnd: literal ? literal.getEnd() - 1 : attribute.getEnd(),
  };
}

function migrateOpening(
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement,
  text: string,
  names: Map<string, string>,
  migration: Migration,
) {
  const attributes = node.attributes.properties
    .filter(ts.isJsxAttribute)
    .map(jsxAttribute);
  const spread = node.attributes.properties.some(ts.isJsxSpreadAttribute);
  migrateAttributes(
    text,
    {
      attributes,
      insert: node.attributes.getEnd(),
      spread,
      component: names.has(node.tagName.getText()),
    },
    migration,
  );
  if (spread && names.has(node.tagName.getText())) {
    migration.issues.push(
      issueAt(
        text,
        node.getStart(),
        'Component spread props need manual API migration',
      ),
    );
    return;
  }
  migrateProps(text, node.tagName.getText(), attributes, names, migration);
  const inline = attributes.find((attribute) => attribute.name === 'style');
  if (
    inline &&
    /--(?:color-|switch-|toast-|stack-|cluster-)/.test(
      text.slice(inline.start, inline.end),
    )
  )
    migration.issues.push(
      issueAt(text, inline.start, 'Inline CSS needs manual token migration'),
    );
}

function moduleUse(node: ts.Node, text: string, migration: Migration) {
  if (
    ts.isExportDeclaration(node) &&
    node.moduleSpecifier &&
    ts.isStringLiteral(node.moduleSpecifier)
  )
    migrateImport(text, node.moduleSpecifier, migration);
  if (!ts.isCallExpression(node)) return;
  const literal = node.arguments[0];
  if (!literal || !ts.isStringLiteral(literal) || !isSapphire(literal.text))
    return;
  if (node.expression.kind === ts.SyntaxKind.ImportKeyword)
    migrateImport(text, literal, migration);
  if (node.expression.getText() === 'require')
    migration.issues.push(
      issueAt(
        text,
        node.getStart(),
        'CommonJS is removed; migrate this require to an ESM public-subpath import',
      ),
    );
}

export function migrateJsx(file: string, text: string, migration: Migration) {
  if (!validScript(file, text, migration)) return;
  const names = componentImports(file, text, migration);
  const source = parseSource(file, text);
  removeShadowed(source, names, migration);
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node))
      migrateOpening(node, text, names, migration);
    moduleUse(node, text, migration);
    ts.forEachChild(node, visit);
  };
  visit(source);
}
