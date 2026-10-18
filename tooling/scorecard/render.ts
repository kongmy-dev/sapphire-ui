import type { ComponentRow } from './components';
import type { Measurement, Stylesheet } from './measure';

export type Scorecard = {
  commit: string;
  subject: string;
  notes: readonly string[];
  measurement: Measurement;
  stylesheet: Stylesheet;
  rows: readonly ComponentRow[];
  referencePins: number;
};

const COLUMNS = [
  'css',
  'react',
  'examples',
  'pin',
  'element',
  'registry',
] as const;

const KB_BYTES = 1000;

const count = (value: number) => value.toLocaleString('en-US');

const yesNo = (done: boolean) => (done ? 'yes' : 'no');

function stylesheetLine(stylesheet: Stylesheet): string {
  if (stylesheet.kind === 'unmeasured')
    return `unmeasured (${stylesheet.reason})`;
  const kilobytes = (stylesheet.bytes / KB_BYTES).toFixed(1);
  return `${count(stylesheet.bytes)} bytes (${kilobytes} kB)`;
}

function numberLines(
  measurement: Measurement,
  stylesheet: Stylesheet,
): string[] {
  const lines: [string, string][] = [
    ['runtime dependencies', count(measurement.runtimeDependencies)],
    ['required peers', count(measurement.requiredPeers)],
    ['export entries', count(measurement.exportEntries)],
    ['stray comments', count(measurement.strayComments)],
    [
      'size-gate findings',
      `${count(measurement.sizeFindings)} in ${count(measurement.sizeFailingFiles)} files`,
    ],
    ['markdown lines', count(measurement.markdownLines)],
    ['gzipped stylesheet', stylesheetLine(stylesheet)],
  ];
  const width = Math.max(...lines.map(([label]) => label.length));
  return lines.map(([label, value]) => `${label.padEnd(width)}  ${value}`);
}

const CELL_WIDTH = 8;

const tableRow = (label: string, nameWidth: number, cells: readonly string[]) =>
  [label.padEnd(nameWidth), ...cells.map((cell) => cell.padEnd(CELL_WIDTH))]
    .join('  ')
    .trimEnd();

function tableLines(rows: readonly ComponentRow[]): string[] {
  const nameWidth = Math.max('name'.length, ...rows.map((r) => r.name.length));
  const done = COLUMNS.map((c) => String(rows.filter((row) => row[c]).length));
  return [
    tableRow('name', nameWidth, COLUMNS),
    ...rows.map((row) =>
      tableRow(
        row.name,
        nameWidth,
        COLUMNS.map((c) => yesNo(row[c])),
      ),
    ),
    tableRow('done', nameWidth, done),
  ];
}

export function renderScorecard(card: Scorecard): string {
  const notes = card.notes.map((note) => `note: ${note}`);
  return [
    `scorecard ${card.commit}  ${card.subject}`,
    ...notes,
    '',
    ...numberLines(card.measurement, card.stylesheet),
    '',
    `components: ${count(card.rows.length)} rows`,
    ...tableLines(card.rows),
    '',
    `v3 reference pins: ${count(card.referencePins)}`,
  ].join('\n');
}
