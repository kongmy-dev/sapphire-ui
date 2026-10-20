import { expect, it } from 'bun:test';
import { renderReport } from './report.js';
import { skillRefsGate } from './skill-refs.js';

it('resolves repository and skill-relative paths without treating templates and package imports as files', () => {
  const file = {
    name: '.claude/skills/typescript/SKILL.md',
    text: '`CLAUDE.md`\n`references/tsconfig.md`\n`components/<name>/`\n`@kongmy-dev/sapphire-ui/button`\n`bun run gate`\n[Docs](https://example.com/docs)',
  };
  const exists = (path: string) =>
    path === '/repo/CLAUDE.md' ||
    path === '/repo/.claude/skills/typescript/references/tsconfig.md';
  expect(skillRefsGate('/repo', [file], exists).violations).toEqual([]);
});

it('flags a deleted active skill reference but does not enforce historical ADR paths', () => {
  const result = skillRefsGate(
    '/repo',
    [
      {
        name: '.claude/skills/review-code/SKILL.md',
        text: 'Read `docs/coding/principles.md`.',
      },
      {
        name: 'docs/adr/0001-history.md',
        text: 'The rules lived in `old/path.md`.',
      },
    ],
    () => false,
  );
  expect(result.files).toBe(1);
  expect(result.violations[0]?.problem).toContain('docs/coding/principles.md');
  expect(renderReport(result).text).toContain('SKILL.md:1  P-11');
});

it('fails an empty skill scope', () => {
  expect(renderReport(skillRefsGate('/repo', [], () => true)).ok).toBe(false);
});
