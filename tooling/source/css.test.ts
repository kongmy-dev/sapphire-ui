import { describe, expect, it } from 'bun:test';
import { locate, scanCss } from './css';

describe('css scan', () => {
  it('blanks comments, string contents and unquoted urls without moving anything', () => {
    const text = [
      '.a { /* note */ content: "x;y"; background: url(a;b.png); }',
      '.b { background: url("c;d.png"); } /* two',
      'lines */',
    ].join('\n');
    const { masked, comments } = scanCss(text);
    expect(masked).toHaveLength(text.length);
    expect(masked.split('\n').map((line) => line.length)).toEqual(
      text.split('\n').map((line) => line.length),
    );
    expect(masked).not.toContain('note');
    expect(masked).not.toContain('x;y');
    expect(masked).not.toContain('a;b.png');
    expect(masked).not.toContain('c;d.png');
    expect(comments).toHaveLength(2);
  });

  it('keeps a quote that is escaped inside a string from ending it', () => {
    const { masked } = scanCss('a { content: "say \\" /* hi */ "; }');
    expect(masked).not.toContain('hi');
  });

  it('treats an unterminated comment as running to the end of the file', () => {
    const { comments } = scanCss('a { color: red; } /* open');
    expect(comments).toEqual([{ pos: 18, end: 25 }]);
  });

  it('locates a position by line and column', () => {
    expect(locate('one\ntwo\nthree', 0)).toEqual({ line: 1, column: 0 });
    expect(locate('one\ntwo\nthree', 8)).toEqual({ line: 3, column: 0 });
    expect(locate('one\ntwo\nthree', 10)).toEqual({ line: 3, column: 2 });
  });
});
