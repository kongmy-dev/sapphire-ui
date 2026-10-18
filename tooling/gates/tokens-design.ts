import {
  normaliseValue,
  resolveSheet,
  SCHEMES,
  type Scheme,
  tokenSheet,
} from '../source/token-values';
import type { Violation } from './report';
import type { FileText } from './scope';
import { colourTokenNames, TOKENS_FILE } from './tokens-css';

export const DESIGN_FILE = 'DESIGN.md';

const TOKEN_CELL = /^`(--[\w-]+)`$/;

type Row = { line: number; token: string; cells: string[] };
type Resolved = Record<Scheme, Map<string, string>>;

const stripTicks = (cell: string) => cell.replace(/^`|`$/g, '');

function tokenRows(design: FileText): Row[] {
  return design.text.split('\n').flatMap((text, index) => {
    if (!text.trimStart().startsWith('|')) return [];
    const cells = text
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    const token = TOKEN_CELL.exec(cells[0] ?? '')?.[1];
    return token ? [{ line: index + 1, token, cells: cells.slice(1) }] : [];
  });
}

const violation = (line: number, problem: string, fix: string): Violation => ({
  file: DESIGN_FILE,
  line,
  rule: 'P-5',
  problem,
  fix,
});

const resolvedValue = (resolved: Resolved, scheme: Scheme, token: string) =>
  normaliseValue(resolved[scheme].get(token) ?? '');

function colourRowViolations(row: Row, resolved: Resolved): Violation[] {
  return SCHEMES.flatMap((scheme, index) => {
    const wanted = resolvedValue(resolved, scheme, row.token);
    const written = normaliseValue(stripTicks(row.cells[index] ?? ''));
    return written === wanted
      ? []
      : [
          violation(
            row.line,
            `${row.token} is "${written}" in ${scheme} here and "${wanted}" in ${TOKENS_FILE}`,
            `Write ${wanted} in the ${scheme} column, or change ${TOKENS_FILE}.`,
          ),
        ];
  });
}

function plainRowViolations(row: Row, resolved: Resolved): Violation[] {
  const wanted = resolvedValue(resolved, 'light', row.token);
  const written = normaliseValue(stripTicks(row.cells[0] ?? ''));
  return written === wanted
    ? []
    : [
        violation(
          row.line,
          `${row.token} is "${written}" here and "${wanted}" in ${TOKENS_FILE}`,
          `Write ${wanted} in the value column, or change ${TOKENS_FILE}.`,
        ),
      ];
}

export function designViolations(
  tokens: FileText,
  design: FileText | undefined,
): Violation[] {
  if (!design) {
    return [
      violation(
        1,
        `${DESIGN_FILE} does not exist`,
        `Create ${DESIGN_FILE} with a token table row for every colour token in ${TOKENS_FILE}.`,
      ),
    ];
  }
  const sheet = tokenSheet(tokens.text);
  const colours = colourTokenNames(sheet);
  const resolved: Resolved = {
    light: resolveSheet(sheet, 'light'),
    dark: resolveSheet(sheet, 'dark'),
  };
  const rows = tokenRows(design);
  const covered = new Set(rows.map((row) => row.token));
  const missing = [...colours]
    .filter((token) => !covered.has(token))
    .map((token) =>
      violation(
        1,
        `${token} has no row in a ${DESIGN_FILE} token table`,
        `Add | \`${token}\` | light | dark | use | to the colour table.`,
      ),
    );
  const unknown = rows
    .filter((row) => !resolved.light.has(row.token))
    .map((row) =>
      violation(
        row.line,
        `${row.token} is not declared in ${TOKENS_FILE}`,
        `Remove the row, or declare ${row.token} in ${TOKENS_FILE}.`,
      ),
    );
  const mismatched = rows
    .filter((row) => resolved.light.has(row.token))
    .flatMap((row) =>
      colours.has(row.token)
        ? colourRowViolations(row, resolved)
        : plainRowViolations(row, resolved),
    );
  return [...missing, ...unknown, ...mismatched];
}
