import { expect, it } from 'bun:test';
import { docsGate } from './docs.js';
import { renderReport } from './report.js';

it('accepts current docs, changelog dates and ADR status dates', () => {
  expect(
    docsGate([
      {
        name: 'README.md',
        text: 'Import components from their named subpaths.',
      },
      { name: 'CHANGELOG.md', text: '## 4.0.0 — 2026-10-20' },
      {
        name: 'docs/adr/0001-example.md',
        text: '**Status:** accepted, 2026-10-20\n\nUse shared CSS.',
      },
    ]).violations,
  ).toEqual([]);
});

it('rejects oversized rules and consumer instructions with specific fixes', () => {
  const result = docsGate([
    { name: 'CLAUDE.md', text: 'rule\n'.repeat(121) },
    { name: 'skills/sapphire/SKILL.md', text: 'rule\n'.repeat(61) },
    { name: 'docs/adr/0001-example.md', text: 'word '.repeat(1000) },
  ]);
  expect(result.violations.map((item) => item.line)).toEqual([121, 61, 1]);
  expect(
    result.violations.every(
      (item) => item.rule === 'P-11' && item.fix.length > 0,
    ),
  ).toBe(true);
});

it('rejects installation history dates and filler while retaining the release checklist', () => {
  const result = docsGate([
    {
      name: 'README.md',
      text: 'Installed on 2026-09-04.\nDelve into seamlessly connected components.',
    },
    { name: 'V4-PLAN.md', text: '2026-10-20' },
  ]);
  expect(result.files).toBe(1);
  expect(result.violations.map((item) => item.line)).toEqual([1, 2, 2]);
  expect(renderReport(result).text).toContain('README.md:1  P-11');
});

it('fails an empty documentation scope', () => {
  expect(renderReport(docsGate([])).ok).toBe(false);
});
