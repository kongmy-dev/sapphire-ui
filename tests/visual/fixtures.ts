import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test as base, expect, type Route } from '@playwright/test';
import {
  FONT_SOURCES,
  GOOGLE_STYLESHEET_HOST,
  googleFontCss,
  ICON_CLASS_CSS,
  localFontFile,
} from '../../tooling/visual/fonts';

const THEME_KEY = 'sapphire-theme';
const CONSENT_COOKIE = 'kongmy_consent';
const DECLINED_CONSENT = encodeURIComponent(
  JSON.stringify({ analytics: false }),
);
const UNREACHABLE_HOSTS = ['avatars.githubusercontent.com'];
const CORS = { 'access-control-allow-origin': '*' };
const FONT_ROOT = join(process.cwd(), 'node_modules', '@fontsource-variable');

const readFont = (...parts: string[]) =>
  readFileSync(join(FONT_ROOT, ...parts));

const fontStylesheet = [
  ...FONT_SOURCES.flatMap((source) =>
    source.stylesheets.map((name) =>
      googleFontCss(
        readFont(source.package, name).toString('utf8'),
        source.package,
      ),
    ),
  ),
  ICON_CLASS_CSS,
].join('\n');

async function answer(route: Route, blocked: string[]) {
  const url = new URL(route.request().url());
  const font = localFontFile(url);
  if (url.hostname === 'localhost') return route.continue();
  if (url.hostname === GOOGLE_STYLESHEET_HOST)
    return route.fulfill({
      contentType: 'text/css',
      headers: CORS,
      body: fontStylesheet,
    });
  if (font !== null)
    return route.fulfill({
      contentType: 'font/woff2',
      headers: CORS,
      body: readFont(font.package, 'files', font.file),
    });
  if (UNREACHABLE_HOSTS.includes(url.hostname))
    return route.fulfill({ status: 404 });
  blocked.push(url.href);
  return route.abort();
}

export const test = base.extend({
  context: async ({ context, colorScheme }, use) => {
    const blocked: string[] = [];
    const scheme = colorScheme === 'dark' ? 'dark' : 'light';
    await context.addInitScript(
      ({ key, value }) => {
        if (location.hostname === 'localhost') localStorage.setItem(key, value);
      },
      { key: THEME_KEY, value: scheme },
    );
    await context.addCookies([
      {
        name: CONSENT_COOKIE,
        value: DECLINED_CONSENT,
        domain: 'localhost',
        path: '/',
      },
    ]);
    await context.route(/^https?:/, (route) => answer(route, blocked));
    await use(context);
    expect(blocked, 'requests beyond localhost').toEqual([]);
  },
});

export { expect };
