export type Violation = {
  file: string;
  line: number;
  rule: string;
  problem: string;
  fix: string;
};

export type GateResult = {
  name: string;
  files: number;
  detail?: string;
  violations: Violation[];
};

export type Report = { ok: boolean; text: string };

const fileCount = (files: number) => `${files} file${files === 1 ? '' : 's'}`;

const violationLines = (violation: Violation) => [
  `  ${violation.file}:${violation.line}  ${violation.rule}  ${violation.problem}`,
  `    ${violation.fix}`,
];

export function renderReport(result: GateResult): Report {
  const detail = result.detail ? ` (${result.detail})` : '';
  const header = `${result.name} gate: ${fileCount(result.files)} checked${detail}`;
  const body = result.violations.flatMap(violationLines);
  if (result.files === 0) {
    return {
      ok: false,
      text: [
        header,
        ...body,
        `${result.name} gate: FAIL — nothing was measured`,
      ].join('\n'),
    };
  }
  if (result.violations.length > 0) {
    return {
      ok: false,
      text: [header, ...body, `${result.name} gate: FAIL`].join('\n'),
    };
  }
  return { ok: true, text: [header, `${result.name} gate: OK`].join('\n') };
}

export function finish(result: GateResult): never {
  const report = renderReport(result);
  if (report.ok) console.log(report.text);
  else console.error(report.text);
  process.exit(report.ok ? 0 : 1);
}
