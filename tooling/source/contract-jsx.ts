import ts from 'typescript';

export type JsxContract = {
  classes: { name: string; line: number }[];
  variants: {
    key: string;
    values: string[];
    fallback: string | null;
    line: number;
  }[];
};

const expressionOf = (attribute: ts.JsxAttribute) => {
  const value = attribute.initializer;
  if (value === undefined) return undefined;
  return ts.isJsxExpression(value) ? value.expression : value;
};

function staticText(node: ts.Node | undefined): string {
  if (node === undefined) return '';
  if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node))
    return node.text;
  if (ts.isTemplateExpression(node))
    return [
      node.head.text,
      ...node.templateSpans.map((span) => span.literal.text),
    ].join(' ');
  return '';
}

function classText(node: ts.Node | undefined, checker: ts.TypeChecker): string {
  if (node === undefined) return '';
  const parts = [staticText(node)];
  const visit = (child: ts.Node): void => {
    if (ts.isStringLiteralLike(child)) parts.push(child.text);
    ts.forEachChild(child, visit);
  };
  ts.forEachChild(node, visit);
  const typed = stringValues(checker.getTypeAtLocation(node));
  return [...parts, ...(typed ?? [])].join(' ');
}

function stringValues(type: ts.Type): string[] | null {
  if (type.isStringLiteral()) return [type.value];
  if (type.isNumberLiteral()) return [String(type.value)];
  if (type.flags & ts.TypeFlags.BooleanLike) return [];
  if (type.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) return [];
  if (!type.isUnion()) return null;
  const groups = type.types.map(stringValues);
  return groups.some((group) => group === null)
    ? null
    : groups.flatMap((group) => group ?? []);
}

function defaults(
  source: ts.SourceFile,
  checker: ts.TypeChecker,
): Map<ts.Symbol, string> {
  const found = new Map<ts.Symbol, string>();
  const visit = (node: ts.Node): void => {
    if (
      ts.isBindingElement(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer !== undefined
    ) {
      const value = staticText(node.initializer);
      const symbol = checker.getSymbolAtLocation(node.name);
      if (value !== '' && symbol !== undefined) found.set(symbol, value);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return found;
}

function defaultFor(input: {
  expression: ts.Node;
  fallback: Map<ts.Symbol, string>;
  checker: ts.TypeChecker;
}): string | null {
  const { expression, fallback, checker } = input;
  const node = ts.isBinaryExpression(expression) ? expression.left : expression;
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol !== undefined && fallback.has(symbol))
    return fallback.get(symbol) ?? null;
  if (
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken
  )
    return staticText(expression.right) || null;
  return null;
}

function readTag(input: {
  node: ts.JsxOpeningLikeElement;
  source: ts.SourceFile;
  checker: ts.TypeChecker;
  fallback: Map<ts.Symbol, string>;
}): JsxContract {
  const { node, source, checker, fallback } = input;
  const attributes = node.attributes.properties.filter(ts.isJsxAttribute);
  const classAttribute = attributes.find(
    (attribute) => attribute.name.getText(source) === 'className',
  );
  const classes = classText(
    classAttribute === undefined ? undefined : expressionOf(classAttribute),
    checker,
  )
    .split(/\s+/)
    .filter((name) => name.startsWith('sp-'));
  const line =
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
  const variants = attributes
    .filter((attribute) => attribute.name.getText(source).startsWith('data-'))
    .flatMap((attribute) => {
      const expression = expressionOf(attribute);
      if (expression === undefined) return [];
      const values = stringValues(checker.getTypeAtLocation(expression)) ?? [
        '<unbounded>',
      ];
      const defaultValue = defaultFor({ expression, fallback, checker });
      return classes.map((name) => ({
        key: `${name}/${attribute.name.getText(source)}`,
        values,
        fallback: defaultValue,
        line,
      }));
    });
  return { classes: classes.map((name) => ({ name, line })), variants };
}

export function jsxContract(
  source: ts.SourceFile,
  checker: ts.TypeChecker,
): JsxContract {
  const result: JsxContract = { classes: [], variants: [] };
  const fallback = defaults(source, checker);
  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const read = readTag({ node, source, checker, fallback });
      result.classes.push(...read.classes);
      result.variants.push(...read.variants);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return result;
}
