import ts from 'typescript';

type NodeCost = { cost: number; deeper: boolean };

const NESTING_STRUCTURES = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.ConditionalExpression,
  ts.SyntaxKind.SwitchStatement,
  ts.SyntaxKind.ForStatement,
  ts.SyntaxKind.ForInStatement,
  ts.SyntaxKind.ForOfStatement,
  ts.SyntaxKind.WhileStatement,
  ts.SyntaxKind.DoStatement,
  ts.SyntaxKind.CatchClause,
]);

const FUNCTION_KINDS = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.FunctionDeclaration,
  ts.SyntaxKind.FunctionExpression,
  ts.SyntaxKind.ArrowFunction,
  ts.SyntaxKind.MethodDeclaration,
]);

const LOGICAL_OPERATORS = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.AmpersandAmpersandToken,
  ts.SyntaxKind.BarBarToken,
  ts.SyntaxKind.QuestionQuestionToken,
]);

function ifCost(node: ts.IfStatement, nesting: number): NodeCost {
  const isElseIf =
    ts.isIfStatement(node.parent) && node.parent.elseStatement === node;
  const hasPlainElse =
    node.elseStatement !== undefined && !ts.isIfStatement(node.elseStatement);
  const elseCost = hasPlainElse ? 1 : 0;
  return isElseIf
    ? { cost: 1 + elseCost, deeper: false }
    : { cost: 1 + nesting + elseCost, deeper: true };
}

function logicalCost(node: ts.BinaryExpression): number {
  const op = node.operatorToken.kind;
  if (!LOGICAL_OPERATORS.has(op)) return 0;
  const parentOp = ts.isBinaryExpression(node.parent)
    ? node.parent.operatorToken.kind
    : undefined;
  return parentOp === op ? 0 : 1;
}

function nodeCost(node: ts.Node, nesting: number): NodeCost {
  if (ts.isIfStatement(node)) return ifCost(node, nesting);
  if (NESTING_STRUCTURES.has(node.kind)) {
    return { cost: 1 + nesting, deeper: true };
  }
  if (ts.isBinaryExpression(node)) {
    return { cost: logicalCost(node), deeper: false };
  }
  const isLabelledJump =
    (ts.isBreakStatement(node) || ts.isContinueStatement(node)) && node.label;
  return { cost: isLabelledJump ? 1 : 0, deeper: false };
}

export function cognitiveComplexity(
  fn: ts.FunctionLikeDeclaration,
  stopAtNested = false,
): number {
  let score = 0;

  const walk = (node: ts.Node, nesting: number): void => {
    const isNestedFunction = node !== fn && FUNCTION_KINDS.has(node.kind);
    if (isNestedFunction && stopAtNested) return;
    const { cost, deeper } = nodeCost(node, nesting);
    score += cost;
    const childNesting = deeper || isNestedFunction ? nesting + 1 : nesting;
    ts.forEachChild(node, (child) => {
      walk(child, childNesting);
    });
  };

  if (fn.body) {
    ts.forEachChild(fn.body, (child) => {
      walk(child, 0);
    });
  }
  return score;
}
