/**
 * Structural measurement of the TypeScript sources.
 *
 * This exists because `typecheck`, `test` and a formatter answer "is it correct?" and
 * nothing answers "is it more than it needs to be?". Those are different axes, and only
 * one of them was instrumented.
 *
 * **Code lines never include comments.** A sibling repo shipped a line budget that counted
 * raw lines in a codebase that is a third comment, so the number it gated on was mostly
 * prose; it baselined away every file it would have caught and was deleted. Every count
 * here is of code, with comment volume reported separately as its own figure.
 *
 * Complexity is Sonar's cognitive complexity, computed from the TypeScript AST rather than
 * from a regex: +1 per control-flow break, +nesting depth when that break is nested, +1 per
 * alternation in a chain of mixed logical operators. It measures how hard a function is to
 * hold in your head, which is the thing that actually costs, unlike cyclomatic complexity
 * which counts paths a test suite must cover.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import ts from 'typescript';

export type FileMetrics = {
  path: string;
  codeLines: number;
  commentLines: number;
  blankLines: number;
  maxNesting: number;
  functions: { name: string; line: number; cognitive: number; ownCognitive: number; codeLines: number }[];
  exports: string[];
  typeDecls: number;
  interfaceDecls: number;
  isTest: boolean;
};

export type Snapshot = {
  takenAt: string;
  commit: string;
  totals: {
    files: number;
    srcFiles: number;
    testFiles: number;
    codeLines: number;
    testCodeLines: number;
    commentLines: number;
    commentRatio: number;
    testRatio: number;
    exports: number;
    unreferencedExports: number;
    interfaces: number;
    types: number;
    abstractionsPerKloc: number;
    worstCognitive: number;
    worstOwnCognitive: number;
    functionsOverOwnCognitive15: number;
    functionsOver50Lines: number;
    filesOver300CodeLines: number;
    maxNesting: number;
    cloneBlocks: number;
  };
  files: Record<string, { codeLines: number; commentLines: number; worstOwnCognitive: number }>;
  offenders: {
    cognitive: { file: string; fn: string; line: number; score: number; own: number }[];
    longFunctions: { file: string; fn: string; line: number; lines: number }[];
    bigFiles: { file: string; codeLines: number }[];
    unreferencedExports: { file: string; name: string }[];
  };
};

const SOURCE_GLOBS = ['src', 'registry', 'tests'];

/**
 * Files whose exports a framework resolves by convention rather than by name.
 *
 * "Exported and never imported" is the sharpest signal here — it is the direct measure of
 * surface written before anyone asked for it — and it is also the one most easily discredited
 * by a false positive. Ported to the platform repo it flagged thirty-two findings, of which
 * the first ten were Next.js `page.tsx` and `layout.tsx` components: exported because the
 * router requires the export, referenced by the router's file convention and so by nothing
 * this scan can see. A metric that cries wolf on framework boilerplate is a metric the next
 * person turns off, so these are excluded by shape rather than argued about per finding.
 *
 * This repo is a content script with no such framework; the list costs it nothing and is here
 * so the tool ports without needing the lesson learned twice.
 */
const FRAMEWORK_ENTRY = [
  /(^|\/)(page|layout|template|loading|error|not-found|route|default|middleware|instrumentation)\.tsx?$/,
  /(^|\/)app\.tsx?$/,
  /\.d\.ts$/
];

const isFrameworkEntry = (p: string) => FRAMEWORK_ENTRY.some((re) => re.test(p));

export function listSourceFiles(root: string): string[] {
  const out = execFileSync(
    'find',
    [
      ...SOURCE_GLOBS,
      '-type',
      'f',
      '(',
      '-name',
      '*.ts',
      '-o',
      '-name',
      '*.tsx',
      ')',
      '-not',
      '-path',
      '*/node_modules/*',
      '-not','-path','*/dist/*','-not','-path','*/build/*','-not','-path','*/.next/*','-not','-path','*/coverage/*','-not','-path','*/vendor/*','-not','-path','*/registry-consumer/*'
    ],
    { cwd: root, encoding: 'utf8' }
  );
  return out.split('\n').filter(Boolean).sort();
}

const isTestPath = (p: string) => /\.(test|spec)\.tsx?$/.test(p) || /(^|\/)(test|__tests__)\//.test(p);

/**
 * Cognitive complexity, per the Sonar specification, over a function body.
 *
 * Two figures, because one of them lies about this codebase. Sonar accrues a nested
 * function's score to its parent, which is right in principle and useless in practice here:
 * `makeDirectusBackupStore` is a 1,431-line factory returning an object of methods, so it
 * scores 585 and drowns out every function a person would actually be asked to fix.
 * `own` stops at each nested function boundary — it is the number a lint rule gates on, and
 * the one that moves when someone writes a hard function today.
 */
function cognitiveComplexity(fn: ts.Node, sf: ts.SourceFile, stopAtNested = false): number {
  let score = 0;

  const walk = (node: ts.Node, nesting: number): void => {
    let nextNesting = nesting;

    const increment = (structural: boolean) => {
      score += structural ? 1 + nesting : 1;
      if (structural) nextNesting = nesting + 1;
    };

    switch (node.kind) {
      case ts.SyntaxKind.IfStatement: {
        const stmt = node as ts.IfStatement;
        // `else if` is one increment without nesting, not a fresh nested `if`.
        const isElseIf = ts.isIfStatement(node.parent) && node.parent.elseStatement === node;
        if (!isElseIf) increment(true);
        else score += 1;
        if (stmt.elseStatement && !ts.isIfStatement(stmt.elseStatement)) score += 1;
        break;
      }
      case ts.SyntaxKind.ConditionalExpression:
      case ts.SyntaxKind.SwitchStatement:
      case ts.SyntaxKind.ForStatement:
      case ts.SyntaxKind.ForInStatement:
      case ts.SyntaxKind.ForOfStatement:
      case ts.SyntaxKind.WhileStatement:
      case ts.SyntaxKind.DoStatement:
      case ts.SyntaxKind.CatchClause:
        increment(true);
        break;
      case ts.SyntaxKind.BreakStatement:
      case ts.SyntaxKind.ContinueStatement:
        if ((node as ts.BreakStatement).label) score += 1;
        break;
      case ts.SyntaxKind.BinaryExpression: {
        const op = (node as ts.BinaryExpression).operatorToken.kind;
        const logical =
          op === ts.SyntaxKind.AmpersandAmpersandToken ||
          op === ts.SyntaxKind.BarBarToken ||
          op === ts.SyntaxKind.QuestionQuestionToken;
        // Only the first of a same-operator run counts; a change of operator counts again.
        if (logical) {
          const parentOp = ts.isBinaryExpression(node.parent)
            ? node.parent.operatorToken.kind
            : undefined;
          if (parentOp !== op) score += 1;
        }
        break;
      }
      // A nested function raises the nesting level for what is inside it.
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.FunctionExpression:
      case ts.SyntaxKind.ArrowFunction:
      case ts.SyntaxKind.MethodDeclaration:
        if (node !== fn) {
          if (stopAtNested) return;
          nextNesting = nesting + 1;
        }
        break;
      default:
        break;
    }

    ts.forEachChild(node, (child) => walk(child, nextNesting));
  };

  const body = (fn as ts.FunctionLikeDeclaration).body;
  if (body) ts.forEachChild(body, (child) => walk(child, 0));
  return score;
}

function functionName(node: ts.Node, sf: ts.SourceFile): string {
  const named = node as ts.FunctionLikeDeclaration;
  if (named.name && ts.isIdentifier(named.name)) return named.name.text;
  if (ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name))
    return node.parent.name.text;
  if (ts.isPropertyAssignment(node.parent) && ts.isIdentifier(node.parent.name))
    return node.parent.name.text;
  return `<anonymous@${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}>`;
}

/** Classify every physical line as code, comment or blank. Comments never count as code. */
function lineKinds(sf: ts.SourceFile, text: string) {
  const lines = text.split('\n');
  const kind = new Array<'code' | 'comment' | 'blank'>(lines.length).fill('blank');
  lines.forEach((l, i) => {
    if (l.trim()) kind[i] = 'code';
  });

  const markComments = (start: number, end: number) => {
    const from = sf.getLineAndCharacterOfPosition(start).line;
    const to = sf.getLineAndCharacterOfPosition(Math.max(end - 1, start)).line;
    for (let i = from; i <= to; i++) {
      // A trailing comment on a line of code leaves that line as code.
      const before = lines[i]?.slice(0, i === from ? sf.getLineAndCharacterOfPosition(start).character : 0);
      if (i === from && before?.trim()) continue;
      kind[i] = 'comment';
    }
  };

  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, text);
  let token = scanner.scan();
  while (token !== ts.SyntaxKind.EndOfFileToken) {
    if (
      token === ts.SyntaxKind.SingleLineCommentTrivia ||
      token === ts.SyntaxKind.MultiLineCommentTrivia
    ) {
      markComments(scanner.getTokenStart(), scanner.getTokenEnd());
    }
    token = scanner.scan();
  }
  // The scanner skips leading trivia by default; sweep it explicitly.
  const ranges = [
    ...(ts.getLeadingCommentRanges(text, 0) ?? []),
  ];
  for (const r of ranges) markComments(r.pos, r.end);
  // Walk every node's leading trivia so JSDoc and header blocks are caught.
  const visit = (node: ts.Node) => {
    for (const r of ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [])
      markComments(r.pos, r.end);
    ts.forEachChild(node, visit);
  };
  visit(sf);

  return {
    codeLines: kind.filter((k) => k === 'code').length,
    commentLines: kind.filter((k) => k === 'comment').length,
    blankLines: kind.filter((k) => k === 'blank').length
  };
}

export function measureFile(root: string, rel: string): FileMetrics {
  const text = readFileSync(resolve(root, rel), 'utf8');
  const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const { codeLines, commentLines, blankLines } = lineKinds(sf, text);

  const functions: FileMetrics['functions'] = [];
  const exports: string[] = [];
  let typeDecls = 0;
  let interfaceDecls = 0;
  let maxNesting = 0;

  const isExported = (node: ts.Node) =>
    !!(ts.getCombinedModifierFlags(node as ts.Declaration) & ts.ModifierFlags.Export);

  const collectExportName = (node: ts.Node) => {
    if (ts.isVariableStatement(node) && isExported(node)) {
      for (const d of node.declarationList.declarations)
        if (ts.isIdentifier(d.name)) exports.push(d.name.text);
      return;
    }
    if (
      (ts.isFunctionDeclaration(node) ||
        ts.isClassDeclaration(node) ||
        ts.isInterfaceDeclaration(node) ||
        ts.isTypeAliasDeclaration(node) ||
        ts.isEnumDeclaration(node)) &&
      isExported(node) &&
      node.name
    ) {
      exports.push(node.name.text);
    }
  };

  const visit = (node: ts.Node, depth: number) => {
    maxNesting = Math.max(maxNesting, depth);
    collectExportName(node);
    if (ts.isInterfaceDeclaration(node)) interfaceDecls++;
    if (ts.isTypeAliasDeclaration(node)) typeDecls++;

    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    ) {
      const start = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
      const end = sf.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      functions.push({
        name: functionName(node, sf),
        line: start,
        cognitive: cognitiveComplexity(node, sf),
        ownCognitive: cognitiveComplexity(node, sf, true),
        codeLines: end - start + 1
      });
    }

    const nests =
      ts.isBlock(node) ||
      ts.isIfStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isSwitchStatement(node) ||
      ts.isTryStatement(node);

    ts.forEachChild(node, (child) => visit(child, nests ? depth + 1 : depth));
  };
  ts.forEachChild(sf, (child) => visit(child, 0));

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
    isTest: isTestPath(rel)
  };
}

/** Cross-file duplicated blocks: normalized 8-line windows appearing in more than one file. */
function cloneBlocks(root: string, files: string[]): number {
  const seen = new Map<string, Set<string>>();
  const W = 8;
  for (const f of files) {
    const lines = readFileSync(resolve(root, f), 'utf8')
      .split('\n')
      .map((l) =>
        l
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, 'S')
          .replace(/\b\d+\b/g, 'N')
      )
      .filter((l) => l && !/^(\/\/|\*|\/\*|import |export \{)/.test(l) && l.length > 8);
    for (let i = 0; i + W <= lines.length; i++) {
      const key = lines.slice(i, i + W).join('\n');
      if (!seen.has(key)) seen.set(key, new Set());
      seen.get(key)!.add(f);
    }
  }
  let n = 0;
  for (const files_ of seen.values()) if (files_.size > 1) n++;
  return n;
}

export function snapshot(root: string): Snapshot {
  const files = listSourceFiles(root);
  const measured = files.map((f) => measureFile(root, f));
  const src = measured.filter((m) => !m.isTest);
  const tests = measured.filter((m) => m.isTest);

  const codeLines = src.reduce((a, m) => a + m.codeLines, 0);
  const testCodeLines = tests.reduce((a, m) => a + m.codeLines, 0);
  const commentLines = src.reduce((a, m) => a + m.commentLines, 0);

  // An export referenced nowhere but its own file is speculative surface.
  const wholeSource = measured.map((m) => readFileSync(resolve(root, m.path), 'utf8')).join('\n');
  const unreferenced: { file: string; name: string }[] = [];
  for (const m of src) {
    if (isFrameworkEntry(m.path)) continue;
    for (const name of m.exports) {
      const uses = (wholeSource.match(new RegExp(`\\b${name}\\b`, 'g')) ?? []).length;
      if (uses <= 1) unreferenced.push({ file: m.path, name });
    }
  }

  const allFns = src.flatMap((m) => m.functions.map((fn) => ({ ...fn, file: m.path })));
  const byCognitive = [...allFns].sort((a, b) => b.ownCognitive - a.ownCognitive);
  const byLength = [...allFns].sort((a, b) => b.codeLines - a.codeLines);
  const bigFiles = [...src].sort((a, b) => b.codeLines - a.codeLines);

  const interfaces = src.reduce((a, m) => a + m.interfaceDecls, 0);
  const types = src.reduce((a, m) => a + m.typeDecls, 0);
  const exportsTotal = src.reduce((a, m) => a + m.exports.length, 0);

  return {
    takenAt: new Date().toISOString(),
    commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    totals: {
      files: measured.length,
      srcFiles: src.length,
      testFiles: tests.length,
      codeLines,
      testCodeLines,
      commentLines,
      commentRatio: +(commentLines / Math.max(codeLines, 1)).toFixed(3),
      testRatio: +(testCodeLines / Math.max(codeLines, 1)).toFixed(3),
      exports: exportsTotal,
      unreferencedExports: unreferenced.length,
      interfaces,
      types,
      abstractionsPerKloc: +(((interfaces + types) / Math.max(codeLines, 1)) * 1000).toFixed(1),
      worstCognitive: Math.max(...allFns.map((f) => f.cognitive), 0),
      worstOwnCognitive: byCognitive[0]?.ownCognitive ?? 0,
      functionsOverOwnCognitive15: allFns.filter((f) => f.ownCognitive > 15).length,
      functionsOver50Lines: allFns.filter((f) => f.codeLines > 50).length,
      filesOver300CodeLines: src.filter((m) => m.codeLines > 300).length,
      maxNesting: Math.max(...src.map((m) => m.maxNesting), 0),
      cloneBlocks: cloneBlocks(root, files)
    },
    files: Object.fromEntries(
      measured.map((m) => [
        m.path,
        {
          codeLines: m.codeLines,
          commentLines: m.commentLines,
          worstOwnCognitive: Math.max(...m.functions.map((f) => f.ownCognitive), 0)
        }
      ])
    ),
    offenders: {
      cognitive: byCognitive
        .slice(0, 15)
        .map((f) => ({ file: f.file, fn: f.name, line: f.line, score: f.cognitive, own: f.ownCognitive })),
      longFunctions: byLength
        .slice(0, 15)
        .map((f) => ({ file: f.file, fn: f.name, line: f.line, lines: f.codeLines })),
      bigFiles: bigFiles.slice(0, 15).map((m) => ({ file: m.path, codeLines: m.codeLines })),
      unreferencedExports: unreferenced.slice(0, 40)
    }
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd();
  const out = process.argv[2];
  const snap = snapshot(root);
  if (out) {
    writeFileSync(resolve(root, out), `${JSON.stringify(snap, null, 2)}\n`);
    console.log(`wrote ${relative(root, resolve(root, out))}`);
  }
  console.log(JSON.stringify(snap.totals, null, 2));
}
