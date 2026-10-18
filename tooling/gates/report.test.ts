import { describe, expect, it } from 'bun:test';
import { renderReport } from './report';

describe('gate report', () => {
  it('prints the count and OK for a clean gate', () => {
    expect(renderReport({ name: 'size', files: 12, violations: [] })).toEqual({
      ok: true,
      text: 'size gate: 12 files checked\nsize gate: OK',
    });
  });

  it('prints each failure as file:line, rule and problem, then the fix', () => {
    const report = renderReport({
      name: 'comment',
      files: 41,
      violations: [
        {
          file: 'vite.config.ts',
          line: 27,
          rule: 'P-1',
          problem: 'comment outside the allowed forms',
          fix: 'Move what it knows into a name, a type, a test name or an ADR, then delete it.',
        },
      ],
    });
    expect(report).toEqual({
      ok: false,
      text: [
        'comment gate: 41 files checked',
        '  vite.config.ts:27  P-1  comment outside the allowed forms',
        '    Move what it knows into a name, a type, a test name or an ADR, then delete it.',
        'comment gate: FAIL',
      ].join('\n'),
    });
  });

  it('fails a gate that checked nothing, even with no violation', () => {
    expect(renderReport({ name: 'size', files: 0, violations: [] })).toEqual({
      ok: false,
      text: 'size gate: 0 files checked\nsize gate: FAIL — nothing was measured',
    });
  });

  it('prints what a gate counted beside the file count', () => {
    expect(
      renderReport({
        name: 'dependency',
        files: 2,
        detail: '58 devDependencies, 21 peers',
        violations: [],
      }).text,
    ).toBe(
      'dependency gate: 2 files checked (58 devDependencies, 21 peers)\ndependency gate: OK',
    );
  });
});
