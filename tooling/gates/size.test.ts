import { describe, expect, it } from 'bun:test';
import { renderReport } from './report';
import { sizeGate, sizeViolations } from './size';

const getConsentStatusSource = [
  "import Cookies from 'js-cookie';",
  '',
  "export const CONSENT_COOKIE_NAME = 'kongmy_consent';",
  '',
  'export interface ConsentPreferences {',
  '  analytics: boolean;',
  '}',
  '',
  "export type ConsentState = ConsentPreferences | 'pending';",
  '',
  'export function getConsentStatus(): ConsentState {',
  "  if (typeof document === 'undefined') return 'pending';",
  '',
  '  const consentCookie = Cookies.get(CONSENT_COOKIE_NAME);',
  '  if (consentCookie) {',
  '    try {',
  '      const value = decodeURIComponent(consentCookie);',
  '      return JSON.parse(value) as ConsentPreferences;',
  '    } catch (e) {',
  '      // Fallthrough',
  '    }',
  '  }',
  '',
  '  // Fallback to legacy version',
  "  const legacyCookie = Cookies.get('ph_cookie_consent');",
  '  if (legacyCookie) {',
  "    if (legacyCookie === 'granted') return { analytics: true };",
  "    if (legacyCookie === 'denied') return { analytics: false };",
  '  }',
  '',
  "  if (typeof navigator !== 'undefined' && navigator.doNotTrack === '1') {",
  '    return { analytics: false };',
  '  }',
  '',
  "  return 'pending';",
  '}',
  '',
].join('\n');

describe('size gate: reader load', () => {
  it('flags a function whose cognitive complexity passes the limit', () => {
    expect(
      sizeViolations({ name: 'consent.ts', text: getConsentStatusSource }),
    ).toEqual([
      {
        file: 'consent.ts',
        line: 11,
        rule: 'P-7',
        problem: 'getConsentStatus: cognitive complexity 11 (limit 7)',
        fix: 'Turn the leading conditions into guard clauses that return early, and lift any branch that only computes a value into a named helper.',
      },
    ]);
  });

  it('flags a function longer than the line limit', () => {
    const body = Array.from({ length: 90 }, (_, n) => `  step(${n});`);
    const text = ['export function run() {', ...body, '}', ''].join('\n');
    expect(
      sizeViolations({ name: 'run.ts', text }).map((v) => v.problem),
    ).toEqual(['run: 92 lines (limit 89)']);
  });

  it('flags a file past the code-line limit at line 1', () => {
    const text = Array.from(
      { length: 480 },
      (_, n) => `export const value${n} = ${n};`,
    ).join('\n');
    expect(sizeViolations({ name: 'big.ts', text })).toEqual([
      {
        file: 'big.ts',
        line: 1,
        rule: 'P-7',
        problem: '480 code lines (limit 474)',
        fix: 'Split it along the seam the exports already suggest, or move the part with no local caller to where it is used.',
      },
    ]);
  });

  it('lets a test file run past the function and file line limits', () => {
    const body = Array.from({ length: 90 }, (_, n) => `  step(${n});`);
    const text = ['export function run() {', ...body, '}', ''].join('\n');
    expect(sizeViolations({ name: 'run.test.ts', text })).toEqual([]);
  });

  it('prints the violation as file:line, P-7 and the fix', () => {
    const report = renderReport(
      sizeGate([{ name: 'consent.ts', text: getConsentStatusSource }]),
    );
    expect(report.ok).toBe(false);
    expect(report.text.split('\n').slice(0, 2)).toEqual([
      'size gate: 1 file checked',
      '  consent.ts:11  P-7  getConsentStatus: cognitive complexity 11 (limit 7)',
    ]);
  });
});

describe('size gate: a gate that checked nothing fails', () => {
  it('fails with no files', () => {
    expect(renderReport(sizeGate([]))).toEqual({
      ok: false,
      text: 'size gate: 0 files checked\nsize gate: FAIL — nothing was measured',
    });
  });

  it('passes a small file and prints its count', () => {
    expect(
      renderReport(sizeGate([{ name: 'a.ts', text: 'export const a = 1;\n' }])),
    ).toEqual({ ok: true, text: 'size gate: 1 file checked\nsize gate: OK' });
  });
});
