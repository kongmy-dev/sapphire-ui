type Span = { pos: number; end: number };

type Region = { blank: Span; next: number; isComment: boolean };

export type CssScan = { masked: string; comments: Span[] };

const isQuote = (char: string | undefined) => char === '"' || char === "'";

function closingQuote(text: string, open: number): number {
  const quote = text[open];
  let index = open + 1;
  while (index < text.length && text[index] !== quote && text[index] !== '\n') {
    index += text[index] === '\\' ? 2 : 1;
  }
  return Math.min(index, text.length);
}

function commentRegion(text: string, start: number): Region | null {
  if (text[start] !== '/' || text[start + 1] !== '*') return null;
  const close = text.indexOf('*/', start + 2);
  const end = close < 0 ? text.length : close + 2;
  return { blank: { pos: start, end }, next: end, isComment: true };
}

function stringRegion(text: string, start: number): Region | null {
  if (!isQuote(text[start])) return null;
  const close = closingQuote(text, start);
  return {
    blank: { pos: start + 1, end: close },
    next: close + 1,
    isComment: false,
  };
}

const UNQUOTED_URL = /^url\(\s*(?!["'\s])/i;

function urlRegion(text: string, start: number): Region | null {
  if (text[start] !== 'u' && text[start] !== 'U') return null;
  if (/[\w-]/.test(text[start - 1] ?? '')) return null;
  const opening = UNQUOTED_URL.exec(text.slice(start, start + 64));
  if (!opening) return null;
  const from = start + opening[0].length;
  const close = text.indexOf(')', from);
  const end = close < 0 ? text.length : close;
  return { blank: { pos: from, end }, next: end + 1, isComment: false };
}

const regionAt = (text: string, start: number): Region | null =>
  commentRegion(text, start) ??
  stringRegion(text, start) ??
  urlRegion(text, start);

function blankSpan(chars: string[], { pos, end }: Span): void {
  for (let index = pos; index < end; index++) {
    if (chars[index] !== '\n') chars[index] = ' ';
  }
}

function blanked(text: string, spans: readonly Span[]): string {
  const chars = text.split('');
  for (const span of spans) blankSpan(chars, span);
  return chars.join('');
}

export function scanCss(text: string): CssScan {
  const blanks: Span[] = [];
  const comments: Span[] = [];
  let index = 0;
  while (index < text.length) {
    const region = regionAt(text, index);
    if (!region) {
      index += 1;
      continue;
    }
    blanks.push(region.blank);
    if (region.isComment) comments.push(region.blank);
    index = region.next;
  }
  return { masked: blanked(text, blanks), comments };
}

export function locate(
  text: string,
  position: number,
): { line: number; column: number } {
  const before = text.slice(0, position);
  const lineStart = before.lastIndexOf('\n') + 1;
  return { line: before.split('\n').length, column: position - lineStart };
}
