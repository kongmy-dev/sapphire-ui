import { locate, scanCss } from './css';
import type { ImportEdge } from './imports';

export function cssImports(text: string): ImportEdge[] {
  const scan = scanCss(text);
  return [...scan.masked.matchAll(/@import\b/g)].map((match) => {
    const clause = text.slice(match.index).split(';')[0] ?? '';
    const target =
      /^@import\s+(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s);]+))/.exec(clause);
    return {
      specifier: target?.[1] ?? target?.[2] ?? target?.[3] ?? null,
      line: locate(text, match.index).line,
    };
  });
}
