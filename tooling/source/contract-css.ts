import { scanCss } from './css';

export type CssContract = {
  classes: Set<string>;
  variants: Map<string, Set<string>>;
};
const TOKENS = /\.(sp-[\w-]+)|\[data-([\w-]+)\s*=\s*["']?([\w-]+)["']?\]/g;

function withoutComments(text: string): string {
  let clean = text;
  for (const span of [...scanCss(text).comments].reverse())
    clean =
      clean.slice(0, span.pos) +
      ' '.repeat(span.end - span.pos) +
      clean.slice(span.end);
  return clean;
}

function addVariant(input: {
  token: RegExpExecArray;
  current: string;
  variants: CssContract['variants'];
}): void {
  const { token, current, variants } = input;
  if (token[2] === undefined || token[3] === undefined || current === '')
    return;
  const key = `${current}/data-${token[2]}`;
  const values = variants.get(key) ?? new Set<string>();
  values.add(token[3]);
  variants.set(key, values);
}

function readSelector(part: string, contract: CssContract): void {
  let current = '';
  for (const token of part.matchAll(TOKENS)) {
    if (token[1] !== undefined) {
      current = token[1];
      contract.classes.add(current);
    }
    addVariant({ token, current, variants: contract.variants });
  }
}

export function cssContract(text: string): CssContract {
  const contract: CssContract = { classes: new Set(), variants: new Map() };
  const clean = withoutComments(text);
  for (const match of scanCss(clean).masked.matchAll(/([^{}]+)\{/g)) {
    const selector = clean.slice(
      match.index,
      match.index + (match[1]?.length ?? 0),
    );
    if (selector.trimStart().startsWith('@')) continue;
    for (const part of selector.split(',')) readSelector(part, contract);
  }
  return contract;
}
