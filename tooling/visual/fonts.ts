export const GOOGLE_STYLESHEET_HOST = 'fonts.googleapis.com';
const GOOGLE_FONT_HOST = 'fonts.gstatic.com';
const LOCAL_FONT_PATH = '/__local/';

export const FONT_SOURCES = [
  { package: 'newsreader', stylesheets: ['wght.css', 'wght-italic.css'] },
  { package: 'source-sans-3', stylesheets: ['wght.css'] },
  { package: 'jetbrains-mono', stylesheets: ['wght.css'] },
  { package: 'material-symbols-outlined', stylesheets: ['full.css'] },
] as const;

type FontPackage = (typeof FONT_SOURCES)[number]['package'];

export type FontFile = { package: FontPackage; file: string };

export const ICON_CLASS_CSS = `.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}`;

const FAMILY = /font-family: '([^']+) Variable'/g;
const RELATIVE_URL = /url\(\.\/files\/([^)]+)\)/g;
const FONT_FILE = /^[a-z0-9-]+\.woff2$/;

export const googleFontCss = (source: string, fontPackage: string): string =>
  source
    .replace(FAMILY, "font-family: '$1'")
    .replace(
      RELATIVE_URL,
      `url(https://${GOOGLE_FONT_HOST}${LOCAL_FONT_PATH}${fontPackage}/$1)`,
    );

export function localFontFile(url: URL): FontFile | null {
  if (url.hostname !== GOOGLE_FONT_HOST) return null;
  if (!url.pathname.startsWith(LOCAL_FONT_PATH)) return null;
  const [fontPackage, file] = url.pathname
    .slice(LOCAL_FONT_PATH.length)
    .split('/');
  const source = FONT_SOURCES.find((entry) => entry.package === fontPackage);
  if (source === undefined || file === undefined) return null;
  return FONT_FILE.test(file) ? { package: source.package, file } : null;
}
