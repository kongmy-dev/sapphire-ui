import ts from 'typescript';
import { locate, scanCss } from '../source/css';
import { parseSource } from '../source/parse';
import { finish, type GateResult, type Violation } from './report';
import { type FileText, loadFiles } from './scope';
import { TOKENS_FILE, tokenFileViolations } from './tokens-css';
import { DESIGN_FILE, designViolations } from './tokens-design';

const TOKEN_FOLDERS = [
  'css/',
  'components/',
  'blocks/',
  'elements/',
  'site/',
] as const;
const TOKEN_EXTENSIONS = ['.css', '.ts', '.tsx'] as const;
const SPECIMEN_EXTENSION = '.examples.html';
const GATE_EXTENSIONS = [
  ...TOKEN_EXTENSIONS,
  SPECIMEN_EXTENSION,
  '.md',
] as const;
const RUNTIME_VARIABLE_PREFIXES = ['--radix-'] as const;
const ANCHOR_ATTRIBUTES = ['href', 'to'] as const;

const HEX_COLOUR = /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi;
const COLOUR_FUNCTION =
  /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^)]*\)?/gi;
const LENGTH = /(?<![\w.#-])[+-]?\d*\.?\d+(?:px|rem|pt|pc|cm|mm|in|q|ex)\b/gi;
const VARIABLE_USE = /var\(\s*(--[\w-]+)/g;
const ARBITRARY_VALUE = /\[([^\]]*)\]/g;
const URL_CALL = /url\([^)]*\)/gi;
const STYLE_ATTRIBUTE = /\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

type Hit = { index: number; value: string };
type RegionKind = 'css-value' | 'class-string';
type Region = { start: number; text: string; kind: RegionKind };
type Analysis = {
  file: FileText;
  regions: Region[];
  declared: string[];
  uses: Hit[];
};
type StringNode =
  | ts.StringLiteral
  | ts.NoSubstitutionTemplateLiteral
  | ts.TemplateHead
  | ts.TemplateMiddle
  | ts.TemplateTail;

function hits(pattern: RegExp, text: string): Hit[] {
  return [...text.matchAll(pattern)].map((match) => ({
    index: match.index,
    value: match[0],
  }));
}

const colourHits = (text: string) => [
  ...hits(HEX_COLOUR, text),
  ...hits(COLOUR_FUNCTION, text),
];

const lengthHits = (text: string) =>
  hits(LENGTH, text).filter((hit) => Number.parseFloat(hit.value) !== 0);

const arbitraryLengthHits = (text: string): Hit[] =>
  [...text.matchAll(ARBITRARY_VALUE)].flatMap((group) =>
    lengthHits((group[1] ?? '').replaceAll('_', ' ')).map((hit) => ({
      index: group.index + 1 + hit.index,
      value: hit.value,
    })),
  );

const maskUrls = (text: string) =>
  text.replace(URL_CALL, (call) => ' '.repeat(call.length));

type CssStatement = { start: number; text: string; opensBlock: boolean };

function cssStatements(masked: string): CssStatement[] {
  const found: CssStatement[] = [];
  let start = 0;
  for (let index = 0; index < masked.length; index++) {
    const char = masked.charAt(index);
    if (!'{;}'.includes(char)) continue;
    found.push({
      start,
      text: masked.slice(start, index),
      opensBlock: char === '{',
    });
    start = index + 1;
  }
  return found;
}

const isAtRule = (statement: CssStatement) =>
  statement.text.trimStart().startsWith('@');

type Declaration = { property: string; valueStart: number; value: string };

function declarationOf(statement: CssStatement): Declaration[] {
  const colon = statement.text.indexOf(':');
  if (statement.opensBlock || isAtRule(statement) || colon < 0) return [];
  return [
    {
      property: statement.text.slice(0, colon).trim(),
      valueStart: statement.start + colon + 1,
      value: statement.text.slice(colon + 1),
    },
  ];
}

function analyseCss(file: FileText): Analysis {
  const { masked } = scanCss(file.text);
  const statements = cssStatements(masked);
  const declarations = statements.flatMap(declarationOf);
  const applied = statements.filter(
    (statement) =>
      !statement.opensBlock && statement.text.trimStart().startsWith('@apply'),
  );
  const properties = hits(/@property\s+(--[\w-]+)/g, masked).map((hit) =>
    hit.value.replace(/^@property\s+/, ''),
  );
  return {
    file,
    regions: [
      ...declarations.map(
        (d): Region => ({
          start: d.valueStart,
          text: d.value,
          kind: 'css-value',
        }),
      ),
      ...applied.map(
        (s): Region => ({ start: s.start, text: s.text, kind: 'class-string' }),
      ),
    ],
    declared: [
      ...declarations
        .map((d) => d.property)
        .filter((property) => property.startsWith('--')),
      ...properties,
    ],
    uses: variableUses(masked, 0),
  };
}

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

function isAnchorValue(node: ts.Node, source: ts.SourceFile): boolean {
  const { parent } = node;
  return (
    ts.isJsxAttribute(parent) &&
    ANCHOR_ATTRIBUTES.some((name) => name === parent.name.getText(source))
  );
}

function variableUses(text: string, offset: number): Hit[] {
  return [...text.matchAll(VARIABLE_USE)].map((match) => ({
    index: offset + match.index,
    value: match[1] ?? '',
  }));
}

function analyseScript(file: FileText): Analysis {
  const source = parseSource(file.name, file.text);
  const regions = collectStringNodes(source, [])
    .filter((node) => !isAnchorValue(node, source))
    .map(
      (node): Region => ({
        start: node.getStart(source),
        text: node.getText(source),
        kind: 'class-string',
      }),
    );
  return {
    file,
    regions,
    declared: [],
    uses: regions.flatMap((r) => variableUses(r.text, r.start)),
  };
}

function analyseSpecimen(file: FileText): Analysis {
  const regions = [...file.text.matchAll(STYLE_ATTRIBUTE)].map(
    (match): Region => {
      const value = match[1] ?? match[2] ?? '';
      return {
        start: match.index + match[0].length - value.length - 1,
        text: value,
        kind: 'css-value',
      };
    },
  );
  return {
    file,
    regions,
    declared: [],
    uses: regions.flatMap((region) => variableUses(region.text, region.start)),
  };
}

function analyse(file: FileText): Analysis {
  if (file.name.endsWith('.css')) return analyseCss(file);
  if (file.name.endsWith(SPECIMEN_EXTENSION)) return analyseSpecimen(file);
  return analyseScript(file);
}

function regionHits(region: Region) {
  if (region.kind === 'css-value') {
    return {
      colours: colourHits(region.text),
      lengths: lengthHits(region.text),
    };
  }
  const text = maskUrls(region.text);
  return { colours: colourHits(text), lengths: arbitraryLengthHits(text) };
}

const lineOf = (analysis: Analysis, region: Region, hit: Hit) =>
  locate(analysis.file.text, region.start + hit.index).line;

function literalViolations(analysis: Analysis): Violation[] {
  return analysis.regions.flatMap((region) => {
    const { colours, lengths } = regionHits(region);
    return [
      ...colours.map((hit) => ({
        file: analysis.file.name,
        line: lineOf(analysis, region, hit),
        rule: 'P-5',
        problem: `colour literal ${hit.value}`,
        fix: `Add the colour to ${TOKENS_FILE} and use its token.`,
      })),
      ...lengths.map((hit) => ({
        file: analysis.file.name,
        line: lineOf(analysis, region, hit),
        rule: 'P-5',
        problem: `length literal ${hit.value}`,
        fix: `Use a spacing, size or type token from ${TOKENS_FILE} instead of the literal.`,
      })),
    ];
  });
}

const isRuntimeVariable = (name: string) =>
  RUNTIME_VARIABLE_PREFIXES.some((prefix) => name.startsWith(prefix));

function variableViolations(
  analysis: Analysis,
  declared: ReadonlySet<string>,
): Violation[] {
  return analysis.uses
    .filter((use) => !declared.has(use.value) && !isRuntimeVariable(use.value))
    .map((use) => ({
      file: analysis.file.name,
      line: locate(analysis.file.text, use.index).line,
      rule: 'P-5',
      problem: `var(${use.value}) is declared in no CSS file under ${TOKEN_FOLDERS.join(', ')}`,
      fix: `Declare ${use.value} in ${TOKENS_FILE}, or use a token that exists.`,
    }));
}

export function tokenViolations(files: readonly FileText[]): Violation[] {
  const analyses = files.map(analyse);
  const declared = new Set(analyses.flatMap((a) => a.declared));
  return analyses.flatMap((analysis) => [
    ...(analysis.file.name === TOKENS_FILE ? [] : literalViolations(analysis)),
    ...variableViolations(analysis, declared),
  ]);
}

function designTableViolations(files: readonly FileText[]): Violation[] {
  const tokens = files.find((file) => file.name === TOKENS_FILE);
  const design = files.find((file) => file.name === DESIGN_FILE);
  return tokens ? designViolations(tokens, design) : [];
}

export const tokenGate = (files: readonly FileText[]): GateResult => ({
  name: 'token',
  files: files.length,
  violations: [
    ...tokenViolations(files.filter((file) => file.name !== DESIGN_FILE)),
    ...tokenFileViolations(files),
    ...designTableViolations(files),
  ],
});

if (import.meta.main) {
  const files = loadFiles(process.cwd(), [], GATE_EXTENSIONS).filter(
    (file) =>
      file.name === DESIGN_FILE ||
      TOKEN_FOLDERS.some((folder) => file.name.startsWith(folder)),
  );
  finish(tokenGate(files));
}
