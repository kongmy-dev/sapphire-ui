import { finish, type GateResult, type Violation } from './report.js';
import { type FileText, loadFiles } from './scope.js';

const filler =
  /\b(?:delve|foster|seamlessly|game-changing|cutting-edge|leverage)\b/gi;
const date = /\b\d{4}-\d{2}-\d{2}\b/g;
const finding = (
  file: string,
  line: number,
  problem: string,
  fix: string,
): Violation => ({ file, line, rule: 'P-11', problem, fix });
const isAdr = (name: string) => name.startsWith('docs/adr/');

function proseViolations(file: FileText): Violation[] {
  if (file.name === 'CHANGELOG.md') return [];
  return file.text.split('\n').flatMap((text, index) => {
    const violations: Violation[] = [];
    if (!(isAdr(file.name) && /^\*\*Status:\*\*/.test(text)) && date.test(text))
      violations.push(
        finding(
          file.name,
          index + 1,
          'Date outside changelog or ADR status',
          'Describe the current contract; put release dates in CHANGELOG.md.',
        ),
      );
    date.lastIndex = 0;
    for (const match of text.matchAll(filler))
      violations.push(
        finding(
          file.name,
          index + 1,
          `Filler word: ${match[0]}`,
          'State the concrete action or observable result.',
        ),
      );
    return violations;
  });
}

function sizeViolations(file: FileText): Violation[] {
  const lines = file.text.trimEnd().split('\n').length;
  if (file.name === 'CLAUDE.md' && lines > 120)
    return [
      finding(
        file.name,
        121,
        'CLAUDE.md exceeds 120 lines',
        'Keep the rule table and working contract; move detailed guidance into the owning skill.',
      ),
    ];
  if (file.name === 'skills/sapphire/SKILL.md' && lines > 60)
    return [
      finding(
        file.name,
        61,
        'Consumer skill exceeds 60 lines',
        'Keep ownership and integration rules; types and examples document component APIs.',
      ),
    ];
  if (isAdr(file.name) && file.text.trim().split(/\s+/).length >= 1000)
    return [
      finding(
        file.name,
        1,
        'ADR must be under 1,000 words',
        'Keep the decision and critical reasoning; remove narrative and repeated implementation details.',
      ),
    ];
  return [];
}

export function docsGate(files: readonly FileText[]): GateResult {
  const active = files.filter((file) => file.name !== 'V4-PLAN.md');
  return {
    name: 'docs',
    files: active.length,
    violations: active.flatMap((file) => [
      ...proseViolations(file),
      ...sizeViolations(file),
    ]),
  };
}

if (import.meta.main)
  finish(docsGate(loadFiles(process.cwd(), process.argv.slice(2), ['.md'])));
