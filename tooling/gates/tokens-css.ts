import {
  lightDarkArguments,
  type TokenDeclaration,
  tokenSheet,
} from '../source/token-values';
import type { Violation } from './report';
import type { FileText } from './scope';

export const TOKENS_FILE = 'css/tokens.css';
const TAILWIND_FILE = 'css/tailwind.css';
const SCOPE_LIST = ':root, [data-theme=light], [data-theme=dark], .dark';

const SCOPE_SELECTORS = [
  ':root',
  '[data-theme=light]',
  '[data-theme=dark]',
  '.dark',
] as const;
const MAPPING_OPTIONS = ['@theme:inline', '@theme:reference'] as const;
const COLOUR_LITERAL =
  /^(?:#[0-9a-f]{3,8}|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\([\s\S]*\)|transparent|currentcolor)$/i;
const SINGLE_VAR = /^var\(\s*(--[\w-]+)\s*\)$/;
const VAR_NAME = /var\(\s*(--[\w-]+)/g;

const isPerScope = (declaration: TokenDeclaration) =>
  declaration.selectors.length === SCOPE_SELECTORS.length &&
  SCOPE_SELECTORS.every((selector) => declaration.selectors.includes(selector));

const isLiteralColour = (value: string) =>
  value.startsWith('light-dark(') || COLOUR_LITERAL.test(value);

function aliasTarget(value: string): string | null {
  return SINGLE_VAR.exec(value)?.[1] ?? null;
}

function addAliases(
  sheet: readonly TokenDeclaration[],
  colours: Set<string>,
): boolean {
  const before = colours.size;
  for (const { name, value } of sheet) {
    const target = aliasTarget(value);
    if (target && colours.has(target)) colours.add(name);
  }
  return colours.size > before;
}

export function colourTokenNames(
  sheet: readonly TokenDeclaration[],
): Set<string> {
  const colours = new Set(
    sheet.filter((d) => isLiteralColour(d.value)).map((d) => d.name),
  );
  let grew = true;
  while (grew) {
    grew = addAliases(sheet, colours);
  }
  return colours;
}

const isColourArgument = (argument: string, colours: ReadonlySet<string>) => {
  const target = aliasTarget(argument);
  return target ? colours.has(target) : COLOUR_LITERAL.test(argument);
};

function placementViolation(declaration: TokenDeclaration, file: string) {
  return {
    file,
    line: declaration.line,
    rule: 'P-5',
    problem: `${declaration.name} is a colour token declared on ${declaration.selectors.join(', ')}`,
    fix: `Declare it once in the block "${SCOPE_LIST}" as light-dark(<light>, <dark>), so it takes the right side inside a nested scope.`,
  };
}

function argumentViolations(
  declaration: TokenDeclaration,
  colours: ReadonlySet<string>,
  file: string,
): Violation[] {
  return lightDarkArguments(declaration.value)
    .flat()
    .filter((argument) => !isColourArgument(argument, colours))
    .map((argument) => ({
      file,
      line: declaration.line,
      rule: 'P-5',
      problem: `${declaration.name}: light-dark() argument "${argument}" is not a colour`,
      fix: `light-dark() takes only colours. Declare ${declaration.name} once on :root, and have a shadow's colour read a colour token.`,
    }));
}

function placementViolations(tokens: FileText): Violation[] {
  const sheet = tokenSheet(tokens.text);
  const colours = colourTokenNames(sheet);
  return sheet.flatMap((declaration) => {
    const misplaced =
      colours.has(declaration.name) && !isPerScope(declaration)
        ? [placementViolation(declaration, tokens.name)]
        : [];
    return [
      ...misplaced,
      ...argumentViolations(declaration, colours, tokens.name),
    ];
  });
}

function mappedNames(tailwind: FileText | undefined): Set<string> {
  const sheet = tailwind ? tokenSheet(tailwind.text) : [];
  const mapping = sheet.filter((d) =>
    MAPPING_OPTIONS.some((option) => d.selectors.includes(option)),
  );
  return new Set(
    mapping.flatMap((d) =>
      [...d.value.matchAll(VAR_NAME)].map((match) => match[1] ?? ''),
    ),
  );
}

function mappingViolations(
  tokens: FileText,
  tailwind: FileText | undefined,
): Violation[] {
  const mapped = mappedNames(tailwind);
  const seen = new Set<string>();
  return tokenSheet(tokens.text)
    .filter((d) => !mapped.has(d.name) && !seen.has(d.name) && seen.add(d.name))
    .map((d) => ({
      file: tokens.name,
      line: d.line,
      rule: 'P-5',
      problem: `${d.name} has no mapping in ${TAILWIND_FILE}`,
      fix: `Map it in an @theme inline or @theme reference block of ${TAILWIND_FILE}, such as --color-card: var(--card).`,
    }));
}

export function tokenFileViolations(files: readonly FileText[]): Violation[] {
  const tokens = files.find((file) => file.name === TOKENS_FILE);
  if (!tokens) return [];
  const tailwind = files.find((file) => file.name === TAILWIND_FILE);
  return [
    ...placementViolations(tokens),
    ...mappingViolations(tokens, tailwind),
  ];
}
