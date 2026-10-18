import { describe, expect, it } from 'bun:test';
import { googleFontCss, localFontFile } from './fonts';

const fontsourceCss = `@font-face {
  font-family: 'Newsreader Variable';
  font-style: normal;
  src: url(./files/newsreader-latin-wght-normal.woff2) format('woff2-variations');
}`;

describe('google font stylesheet', () => {
  it('declares the Google family name, not the variable one', () => {
    const css = googleFontCss(fontsourceCss, 'newsreader');
    expect(css).toContain("font-family: 'Newsreader';");
    expect(css).not.toContain('Variable');
  });

  it('points each file at the local font path on the Google font host', () => {
    const css = googleFontCss(fontsourceCss, 'newsreader');
    expect(css).toContain(
      'url(https://fonts.gstatic.com/__local/newsreader/newsreader-latin-wght-normal.woff2)',
    );
  });
});

describe('local font files', () => {
  const find = (href: string) => localFontFile(new URL(href));

  it('resolves a woff2 of a pinned font package', () => {
    expect(
      find(
        'https://fonts.gstatic.com/__local/newsreader/a-latin-wght-normal.woff2',
      ),
    ).toEqual({ package: 'newsreader', file: 'a-latin-wght-normal.woff2' });
  });

  it('refuses another host, another package and a path outside the files', () => {
    expect(find('https://example.com/__local/newsreader/a.woff2')).toBeNull();
    expect(find('https://fonts.gstatic.com/__local/lodash/a.woff2')).toBeNull();
    expect(find('https://fonts.gstatic.com/s/newsreader/a.woff2')).toBeNull();
    expect(
      find('https://fonts.gstatic.com/__local/newsreader/..%2Fpackage.json'),
    ).toBeNull();
    expect(
      find('https://fonts.gstatic.com/__local/newsreader/a.css'),
    ).toBeNull();
  });
});
