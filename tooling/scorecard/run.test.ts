import { describe, expect, it } from 'bun:test';
import { parseArgs } from './run';

describe('scorecard arguments', () => {
  it('measures HEAD when no commit is named', () => {
    expect(parseArgs([])).toEqual({ ok: true, revision: 'HEAD' });
  });

  it('takes one commit', () => {
    expect(parseArgs(['bc2e116'])).toEqual({ ok: true, revision: 'bc2e116' });
  });

  it('refuses two commits and anything that looks like a flag', () => {
    expect(parseArgs(['a', 'b']).ok).toBe(false);
    expect(parseArgs(['--help']).ok).toBe(false);
  });
});
