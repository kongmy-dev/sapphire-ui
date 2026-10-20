type Edit = { start: number; end: number; text: string };
export type MigrationIssue = { line: number; message: string };
export type MigrationResult = {
  text: string;
  changes: number;
  issues: MigrationIssue[];
};
export type Migration = { edits: Edit[]; issues: MigrationIssue[] };
const lineAt = (text: string, offset: number) =>
  text.slice(0, offset).split('\n').length;
export const issueAt = (
  text: string,
  offset: number,
  message: string,
): MigrationIssue => ({ line: lineAt(text, offset), message });

export function applyEdits(
  text: string,
  migration: Migration,
): MigrationResult {
  let next = text;
  let previousStart = text.length;
  for (const edit of [...migration.edits].sort((a, b) => b.start - a.start)) {
    if (edit.end > previousStart)
      throw new Error('Overlapping migration edits');
    next = next.slice(0, edit.start) + edit.text + next.slice(edit.end);
    previousStart = edit.start;
  }
  return {
    text: next,
    changes: migration.edits.length,
    issues: migration.issues,
  };
}
