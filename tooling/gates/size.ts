import { checkText } from '../quality-metrics/check';
import { finish, type GateResult, type Violation } from './report';
import { type FileText, loadFiles } from './scope';

export const SIZE_EXTENSIONS = ['.ts', '.tsx'] as const;

export const sizeViolations = (file: FileText): Violation[] =>
  checkText(file.name, file.text).map((finding) => ({
    file: file.name,
    line: finding.line,
    rule: 'P-7',
    problem: finding.problem,
    fix: finding.fix,
  }));

export const sizeGate = (files: readonly FileText[]): GateResult => ({
  name: 'size',
  files: files.length,
  violations: files.flatMap(sizeViolations),
});

if (import.meta.main) {
  finish(
    sizeGate(loadFiles(process.cwd(), process.argv.slice(2), SIZE_EXTENSIONS)),
  );
}
