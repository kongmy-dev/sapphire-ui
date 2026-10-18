import { locate, scanCss } from './css';

export const SCHEMES = ['light', 'dark'] as const;
export type Scheme = (typeof SCHEMES)[number];

export type TokenDeclaration = {
  name: string;
  value: string;
  line: number;
  selectors: readonly string[];
};

type RawRule = { prelude: string; bodyStart: number; body: string };
type Rgba = [number, number, number, number];

const BASE_SELECTORS = [':root', '@theme'] as const;
const DARK_SELECTORS = ['[data-theme=dark]'] as const;
const TOKEN_SCOPES = [
  ...BASE_SELECTORS,
  ...DARK_SELECTORS,
  '[data-theme=light]',
  '.dark',
] as const;
const BRACE_DELTA: Record<string, number> = { '{': 1, '}': -1 };
const PAREN_DELTA: Record<string, number> = { '(': 1, ')': -1 };
const DECLARATION = /^\s*(--[\w-]+)\s*:\s*([\s\S]*?)\s*$/;
const VAR_CALL = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g;
const HEX_COLOUR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_CALL =
  /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)\s*)?\)$/i;
const COLOR_MIX_OVER_TRANSPARENT =
  /color-mix\(\s*in\s+srgb\s*,\s*(#[0-9a-f]{3,6}|rgba?\([^)]*\))\s+([\d.]+)%\s*,\s*transparent\s*\)/gi;
const MAX_VAR_DEPTH = 32;

function withoutComments(css: string): { plain: string; masked: string } {
  const { masked, comments } = scanCss(css);
  let plain = css;
  for (const { pos, end } of comments) {
    const blank = plain.slice(pos, end).replace(/[^\n]/g, ' ');
    plain = plain.slice(0, pos) + blank + plain.slice(end);
  }
  return { plain, masked };
}

function closingBrace(masked: string, open: number): number {
  let depth = 0;
  for (let index = open; index < masked.length; index++) {
    depth += BRACE_DELTA[masked.charAt(index)] ?? 0;
    if (depth === 0) return index;
  }
  return masked.length;
}

function topLevelRules(plain: string, masked: string): RawRule[] {
  const rules: RawRule[] = [];
  let from = 0;
  let open = masked.indexOf('{');
  while (open >= 0) {
    const close = closingBrace(masked, open);
    const between = plain.slice(from, open);
    rules.push({
      prelude: between.slice(between.lastIndexOf(';') + 1),
      bodyStart: open + 1,
      body: plain.slice(open + 1, close),
    });
    from = close + 1;
    open = masked.indexOf('{', from);
  }
  return rules;
}

const normaliseSelector = (selector: string) =>
  selector.replace(/["']/g, '').replace(/\s+/g, ' ').trim();

function selectorsOf(prelude: string): string[] {
  const text = prelude.trim();
  if (text.startsWith('@theme')) return ['@theme'];
  if (text.startsWith('@')) return [];
  return text.split(',').map(normaliseSelector);
}

function declarationsOf(
  rule: RawRule,
  selectors: string[],
  plain: string,
): TokenDeclaration[] {
  const found: TokenDeclaration[] = [];
  let offset = 0;
  for (const statement of rule.body.split(';')) {
    const match = DECLARATION.exec(statement);
    const at = rule.bodyStart + offset + statement.indexOf('--');
    offset += statement.length + 1;
    if (!match) continue;
    found.push({
      name: match[1] ?? '',
      value: match[2] ?? '',
      line: locate(plain, at).line,
      selectors,
    });
  }
  return found;
}

export function tokenSheet(css: string): TokenDeclaration[] {
  const { plain, masked } = withoutComments(css);
  return topLevelRules(plain, masked).flatMap((rule) => {
    const selectors = selectorsOf(rule.prelude);
    const isScope = selectors.some((selector) =>
      TOKEN_SCOPES.some((scope) => scope === selector),
    );
    return isScope ? declarationsOf(rule, selectors, plain) : [];
  });
}

const hasSelector = (
  declaration: TokenDeclaration,
  wanted: readonly string[],
) => declaration.selectors.some((selector) => wanted.includes(selector));

function rawValues(
  sheet: readonly TokenDeclaration[],
  scheme: Scheme,
): Map<string, string> {
  const raw = new Map<string, string>();
  const phases =
    scheme === 'dark' ? [BASE_SELECTORS, DARK_SELECTORS] : [BASE_SELECTORS];
  for (const wanted of phases) {
    for (const declaration of sheet.filter((d) => hasSelector(d, wanted))) {
      raw.set(declaration.name, declaration.value);
    }
  }
  return raw;
}

function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index++) {
    const char = text.charAt(index);
    depth += PAREN_DELTA[char] ?? 0;
    if (char === separator && depth === 0) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  return [...parts, text.slice(start)];
}

function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let index = open; index < text.length; index++) {
    depth += PAREN_DELTA[text.charAt(index)] ?? 0;
    if (depth === 0) return index;
  }
  return text.length;
}

function pickLightDark(value: string, scheme: Scheme): string {
  const start = value.indexOf('light-dark(');
  if (start < 0) return value;
  const open = start + 'light-dark'.length;
  const close = closingParen(value, open);
  const args = splitTopLevel(value.slice(open + 1, close), ',');
  const chosen = (scheme === 'dark' ? args[1] : args[0]) ?? '';
  return pickLightDark(
    value.slice(0, start) + chosen.trim() + value.slice(close + 1),
    scheme,
  );
}

function substitute(
  value: string,
  raw: ReadonlyMap<string, string>,
  depth: number,
): string {
  if (depth > MAX_VAR_DEPTH) return value;
  return value.replace(VAR_CALL, (call, name: string, fallback?: string) => {
    const target = raw.get(name) ?? fallback;
    return target === undefined ? call : substitute(target, raw, depth + 1);
  });
}

export function resolveSheet(
  sheet: readonly TokenDeclaration[],
  scheme: Scheme,
): Map<string, string> {
  const raw = rawValues(sheet, scheme);
  const resolved = new Map<string, string>();
  for (const [name, value] of raw) {
    resolved.set(name, pickLightDark(substitute(value, raw, 0), scheme));
  }
  return resolved;
}

function parseHex(text: string): Rgba | null {
  const digits = HEX_COLOUR.exec(text)?.[1];
  if (!digits) return null;
  const full =
    digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  const [r = 0, g = 0, b = 0] = [0, 2, 4].map((at) =>
    Number.parseInt(full.slice(at, at + 2), 16),
  );
  return [r, g, b, 1];
}

function parseRgb(text: string): Rgba | null {
  const match = RGB_CALL.exec(text);
  if (!match) return null;
  return [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
    Number(match[4] ?? 1),
  ];
}

function flattenMix(call: string, base: string, percent: string): string {
  const colour = parseHex(base) ?? parseRgb(base);
  if (!colour) return call;
  const alpha = Number((colour[3] * (Number(percent) / 100)).toFixed(4));
  return `rgb(${colour[0]}, ${colour[1]}, ${colour[2]}, ${alpha})`;
}

export function normaliseValue(value: string): string {
  return value
    .replace(COLOR_MIX_OVER_TRANSPARENT, flattenMix)
    .replace(/#[0-9a-f]{3,8}\b/gi, (hex) => hex.toLowerCase())
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();
}
