import { describe, expect, it } from 'bun:test';
import { PIN_USAGE, parseExamples, titleGrep } from './pin-args';

const known = ['buttons/variants', 'buttons/sizes', 'data/progress'];

describe('pin arguments', () => {
  it('refuses an empty list and prints the usage line', () => {
    expect(parseExamples([], known)).toEqual({ ok: false, message: PIN_USAGE });
    expect(PIN_USAGE).toContain('bun run pin <example>');
  });

  it('refuses an example that no spec defines, naming it', () => {
    const result = parseExamples(['buttons/variants', 'buttons/size'], known);
    expect(result).toEqual({
      ok: false,
      message: 'unknown example: buttons/size',
    });
  });

  it('takes known examples once each, in the order given', () => {
    const result = parseExamples(
      ['data/progress', 'buttons/variants', 'data/progress'],
      known,
    );
    expect(result).toEqual({
      ok: true,
      examples: ['data/progress', 'buttons/variants'],
    });
  });
});

describe('pin title matching', () => {
  const matches = (examples: string[], title: string) =>
    new RegExp(titleGrep(examples)).test(title);

  it('matches the named examples at the end of the full title', () => {
    const grep = ['buttons/variants', 'data/progress'];
    expect(matches(grep, 'pins.spec.ts buttons/variants')).toBe(true);
    expect(matches(grep, '[dark] pins.spec.ts data/progress')).toBe(true);
    expect(matches(grep, 'buttons/variants')).toBe(true);
  });

  it('leaves out an example that only shares a prefix or a suffix', () => {
    const grep = ['buttons/variants'];
    expect(matches(grep, 'pins.spec.ts buttons/variants-more')).toBe(false);
    expect(matches(grep, 'pins.spec.ts xbuttons/variants')).toBe(false);
    expect(matches(grep, 'pins.spec.ts manifest/buttons')).toBe(false);
  });

  it('reads a dot or a dash in an example literally', () => {
    expect(matches(['a-b/c.d'], 'pins.spec.ts a-b/c.d')).toBe(true);
    expect(matches(['a-b/c.d'], 'pins.spec.ts a-b/cxd')).toBe(false);
  });
});
