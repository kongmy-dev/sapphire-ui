export type PinArgs =
  | { ok: true; examples: string[] }
  | { ok: false; message: string };

export const PIN_USAGE =
  'usage: bun run pin <example>...   (an example is <route>/<section>, such as buttons/variants)';

const escapeRegExp = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');

export function parseExamples(
  argv: readonly string[],
  known: readonly string[],
): PinArgs {
  if (argv.length === 0) return { ok: false, message: PIN_USAGE };
  const unknown = argv.filter((name) => !known.includes(name));
  if (unknown.length > 0) {
    return { ok: false, message: `unknown example: ${unknown.join(', ')}` };
  }
  return { ok: true, examples: [...new Set(argv)] };
}

export const titleGrep = (examples: readonly string[]): string =>
  examples
    .map((name) =>
      name === 'parity-states' ? 'parity' : `(?:^| )${escapeRegExp(name)}$`,
    )
    .join('|');
