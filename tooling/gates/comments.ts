import type { CommentRange } from 'typescript';
import { locate, scanCss } from '../source/css';
import { commentRanges, parseSource } from '../source/parse';
import { finish, type GateResult, type Violation } from './report';
import { type FileText, loadFiles } from './scope';

export const COMMENT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.mts',
  '.cts',
  '.css',
] as const;

type Comment = { line: number; text: string; startsLine: boolean };

const BIOME_IGNORE = /^biome-ignore lint\/(?:style|complexity)\/\w+: \S/;
const URL_ALONE = /^https?:\/\/\S+$/;

const bodyOf = (text: string) =>
  text
    .replace(/^\/\/|^\/\*+/, '')
    .replace(/\*+\/$/, '')
    .trim();

function textComments(file: string, text: string): Comment[] {
  const source = parseSource(file, text);
  return commentRanges(source).map((range: CommentRange) => {
    const { line, character } = source.getLineAndCharacterOfPosition(range.pos);
    const lineStart = range.pos - character;
    return {
      line: line + 1,
      text: text.slice(range.pos, range.end),
      startsLine: text.slice(lineStart, range.pos).trim() === '',
    };
  });
}

function cssComments(text: string): Comment[] {
  return scanCss(text).comments.map(({ pos, end }) => {
    const { line, column } = locate(text, pos);
    return {
      line,
      text: text.slice(pos, end),
      startsLine: text.slice(pos - column, pos).trim() === '',
    };
  });
}

const commentsOf = (file: FileText): Comment[] =>
  file.name.endsWith('.css')
    ? cssComments(file.text)
    : textComments(file.name, file.text);

const isUrlAboveWorkaround = (comment: Comment, lines: readonly string[]) =>
  comment.startsLine &&
  !comment.text.includes('\n') &&
  URL_ALONE.test(bodyOf(comment.text)) &&
  (lines[comment.line] ?? '').trim() !== '';

const isAllowed = (comment: Comment, lines: readonly string[]) =>
  BIOME_IGNORE.test(bodyOf(comment.text)) ||
  isUrlAboveWorkaround(comment, lines);

export function commentViolations(file: FileText): Violation[] {
  const lines = file.text.split('\n');
  return commentsOf(file)
    .filter((comment) => !isAllowed(comment, lines))
    .map((comment) => ({
      file: file.name,
      line: comment.line,
      rule: 'P-1',
      problem: 'comment outside the allowed forms',
      fix: 'Move what it knows into a name, a type, a test name or an ADR, then delete it.',
    }));
}

export const commentGate = (files: readonly FileText[]): GateResult => ({
  name: 'comment',
  files: files.length,
  violations: files.flatMap(commentViolations),
});

if (import.meta.main) {
  finish(
    commentGate(
      loadFiles(process.cwd(), process.argv.slice(2), COMMENT_EXTENSIONS),
    ),
  );
}
