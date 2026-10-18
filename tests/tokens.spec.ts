import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import tailwindcss from '@tailwindcss/vite';
import { build } from 'vite';
import {
  resolveSheet,
  type Scheme,
  tokenSheet,
} from '../tooling/source/token-values';

const VARIANTS = ['base', 'sameList', 'rootOnly'] as const;
const FORM_NAMES = ['source', 'bun', 'vite', 'tailwind'] as const;

type Variant = (typeof VARIANTS)[number];
type FormName = (typeof FORM_NAMES)[number];
type Kind = 'plain' | 'tailwind';
type Probe = 'page' | 'card';
type Scope = { theme?: Scheme; dark?: boolean; kids?: Scope[] };
type Built = Record<Variant, string>;
type Expected = { selector: string; probe: Probe; scheme: Scheme };
type Colours = { background: string; colour: string };

const root = resolve(import.meta.dirname, '..');
const tokensPath = join(root, 'css/tokens.css');
const tailwindPath = join(root, 'css/tailwind.css');

const OVERRIDE_VALUE = 'light-dark(#ff0000, #00ff00)';
const OVERRIDE: Record<Variant, string> = {
  base: '',
  sameList: `:root,\n[data-theme="light"],\n[data-theme="dark"],\n.dark {\n  --card: ${OVERRIDE_VALUE};\n}\n`,
  rootOnly: `:root {\n  --card: ${OVERRIDE_VALUE};\n}\n`,
};
const OVERRIDDEN: Record<Scheme, string> = {
  light: 'rgb(255, 0, 0)',
  dark: 'rgb(0, 255, 0)',
};

const PROBE_RULES = [
  '.probe-page { background-color: var(--background); color: var(--foreground); }',
  '.probe-card { background-color: var(--card); color: var(--card-foreground); }',
].join('\n');
const TAILWIND_CANDIDATES =
  '<div class="bg-background text-foreground bg-card text-card-foreground"></div>';
const PROBE_TOKENS: Record<Probe, Colours> = {
  page: { background: '--background', colour: '--foreground' },
  card: { background: '--card', colour: '--card-foreground' },
};
const FORM_KIND: Record<FormName, Kind> = {
  source: 'plain',
  bun: 'plain',
  vite: 'plain',
  tailwind: 'tailwind',
};

const tokenSource = readFileSync(tokensPath, 'utf8');
const sheet = tokenSheet(tokenSource);
const resolved = {
  light: resolveSheet(sheet, 'light'),
  dark: resolveSheet(sheet, 'dark'),
};

function rgbOf(hex: string | undefined): string {
  const digits = (hex ?? '').replace('#', '');
  const full =
    digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits;
  const [r, g, b] = [0, 2, 4].map((at) =>
    Number.parseInt(full.slice(at, at + 2), 16),
  );
  return `rgb(${r}, ${g}, ${b})`;
}

const tokenColour = (token: string, scheme: Scheme) =>
  rgbOf(resolved[scheme].get(token));

function entryCss(kind: Kind, variant: Variant): string {
  const imports =
    kind === 'tailwind'
      ? ['@import "tailwindcss";', '@import "./tailwind.css";']
      : ['@import "./tokens.css";'];
  return `${[...imports, OVERRIDE[variant]].join('\n')}\n`;
}

function projectDir(base: string, name: string, kind: Kind, variant: Variant) {
  const dir = join(base, `${name}-${variant}`);
  mkdirSync(dir);
  symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'));
  copyFileSync(tokensPath, join(dir, 'tokens.css'));
  copyFileSync(tailwindPath, join(dir, 'tailwind.css'));
  writeFileSync(join(dir, 'entry.css'), entryCss(kind, variant));
  return dir;
}

function bunBuild(dir: string): string {
  const out = join(dir, 'out.css');
  execFileSync('bun', ['build', join(dir, 'entry.css'), '--outfile', out], {
    stdio: 'pipe',
  });
  return readFileSync(out, 'utf8');
}

async function viteBuild(dir: string, kind: Kind): Promise<string> {
  const candidates = kind === 'tailwind' ? TAILWIND_CANDIDATES : '';
  writeFileSync(
    join(dir, 'index.html'),
    `<!doctype html><link rel="stylesheet" href="./entry.css">${candidates}`,
  );
  await build({
    root: dir,
    configFile: false,
    logLevel: 'silent',
    plugins: kind === 'tailwind' ? [tailwindcss()] : [],
    build: { outDir: join(dir, 'dist'), emptyOutDir: true },
  });
  const assets = join(dir, 'dist/assets');
  const file = readdirSync(assets).find((name) => name.endsWith('.css'));
  if (!file) throw new Error(`Vite wrote no stylesheet in ${assets}`);
  return readFileSync(join(assets, file), 'utf8');
}

type Builder = (dir: string, kind: Kind, variant: Variant) => Promise<string>;

const BUILDERS: Record<FormName, Builder> = {
  source: async (_dir, _kind, variant) => tokenSource + OVERRIDE[variant],
  bun: async (dir) => bunBuild(dir),
  vite: viteBuild,
  tailwind: viteBuild,
};

async function buildForm(base: string, name: FormName): Promise<Built> {
  const kind = FORM_KIND[name];
  const built: Built = { base: '', sameList: '', rootOnly: '' };
  for (const variant of VARIANTS) {
    const dir = projectDir(base, name, kind, variant);
    built[variant] = await BUILDERS[name](dir, kind, variant);
  }
  return built;
}

let workDir = '';
const forms = new Map<FormName, Built>();

test.beforeAll(async () => {
  test.setTimeout(180_000);
  workDir = mkdtempSync(join(tmpdir(), 'sapphire-tokens-'));
  for (const name of FORM_NAMES) {
    forms.set(name, await buildForm(workDir, name));
  }
});

test.afterAll(() => {
  rmSync(workDir, { recursive: true, force: true });
});

const schemeOf = (scope: Scope, inherited: Scheme): Scheme =>
  scope.theme ?? (scope.dark ? 'dark' : inherited);

const themeAttribute = (scope: Scope) =>
  scope.theme ? ` data-theme="${scope.theme}"` : '';

function probeClass(kind: Kind, probe: Probe): string {
  if (kind === 'plain') return `probe-${probe}`;
  return probe === 'page'
    ? 'bg-background text-foreground'
    : 'bg-card text-card-foreground';
}

function classAttribute(scope: Scope, extra: string): string {
  const names = [extra, scope.dark ? 'dark' : ''].filter(Boolean).join(' ');
  return names ? ` class="${names}"` : '';
}

function nestedHtml(scope: Scope, kind: Kind, path: number[]): string {
  const kids = (scope.kids ?? []).map((kid, at) =>
    nestedHtml(kid, kind, [...path, at]),
  );
  const attributes =
    themeAttribute(scope) + classAttribute(scope, probeClass(kind, 'card'));
  return `<div id="s${path.join('-')}"${attributes}>${kids.join('')}</div>`;
}

function pageHtml(scope: Scope, kind: Kind, css: string): string {
  const kids = (scope.kids ?? []).map((kid, at) => nestedHtml(kid, kind, [at]));
  const head = `<head><style>${css}\n${PROBE_RULES}</style></head>`;
  const body = `<body${classAttribute({}, probeClass(kind, 'page'))}>${kids.join('')}</body>`;
  return `<!doctype html><html${themeAttribute(scope)}${classAttribute(scope, '')}>${head}${body}</html>`;
}

function expectations(
  scope: Scope,
  inherited: Scheme,
  path: number[],
): Expected[] {
  const scheme = schemeOf(scope, inherited);
  const selector = path.length === 0 ? 'body' : `#s${path.join('-')}`;
  const probe: Probe = path.length === 0 ? 'page' : 'card';
  const kids = (scope.kids ?? []).flatMap((kid, at) =>
    expectations(kid, scheme, [...path, at]),
  );
  return [{ selector, probe, scheme }, ...kids];
}

const readColours = (page: Page, selector: string): Promise<Colours> =>
  page.evaluate((query) => {
    const element = document.querySelector(query);
    if (!element) throw new Error(`no element for ${query}`);
    const style = getComputedStyle(element);
    return { background: style.backgroundColor, colour: style.color };
  }, selector);

async function open(page: Page, html: string, emulated: Scheme) {
  await page.emulateMedia({ colorScheme: emulated });
  await page.setContent(html);
}

async function mismatches(page: Page, want: Expected[]): Promise<string[]> {
  const found: string[] = [];
  for (const { selector, probe, scheme } of want) {
    const tokens = PROBE_TOKENS[probe];
    const got = await readColours(page, selector);
    const background = tokenColour(tokens.background, scheme);
    const colour = tokenColour(tokens.colour, scheme);
    if (got.background !== background) {
      found.push(
        `${selector} background ${got.background}, wanted ${background} (${scheme})`,
      );
    }
    if (got.colour !== colour) {
      found.push(
        `${selector} colour ${got.colour}, wanted ${colour} (${scheme})`,
      );
    }
  }
  return found;
}

const builtCss = (name: FormName, variant: Variant) =>
  forms.get(name)?.[variant] ?? '';

async function expectPage(
  page: Page,
  name: FormName,
  scope: Scope,
  emulated: Scheme,
) {
  const html = pageHtml(scope, FORM_KIND[name], builtCss(name, 'base'));
  await open(page, html, emulated);
  const want = expectations(scope, emulated, []);
  expect(await mismatches(page, want), `system ${emulated}`).toEqual([]);
}

const PAGES: { title: string; scope: Scope }[] = [
  {
    title: 'a dark section inside a light page',
    scope: { theme: 'light', kids: [{ theme: 'dark' }] },
  },
  {
    title: 'a light section inside a dark page',
    scope: { theme: 'dark', kids: [{ theme: 'light' }] },
  },
  {
    title: 'light, dark, light nested',
    scope: {
      theme: 'light',
      kids: [{ theme: 'dark', kids: [{ theme: 'light' }] }],
    },
  },
  { title: 'no attribute follows the system', scope: { kids: [{}] } },
  {
    title: '.dark inside a light page',
    scope: { theme: 'light', kids: [{ dark: true }] },
  },
  {
    title: 'a light section inside a .dark page',
    scope: { dark: true, kids: [{ theme: 'light' }] },
  },
  {
    title: '.dark inside a page that follows the system',
    scope: { kids: [{ dark: true }] },
  },
];

function definePageTests(name: FormName) {
  for (const { title, scope } of PAGES) {
    test(`${name}: ${title}`, async ({ page }) => {
      await expectPage(page, name, scope, 'light');
      await expectPage(page, name, scope, 'dark');
    });
  }
}

async function cardBackgrounds(
  page: Page,
  name: FormName,
  variant: Variant,
  scope: Scope,
) {
  const html = pageHtml(scope, FORM_KIND[name], builtCss(name, variant));
  await open(page, html, 'light');
  return {
    nested: (await readColours(page, '#s0')).background,
    inherited: (await readColours(page, '#s1')).background,
  };
}

function defineOverrideTests(name: FormName) {
  const mixed: Scope = { theme: 'light', kids: [{ theme: 'dark' }, {}] };

  test(`${name}: an override on the scope list reaches a nested scope`, async ({
    page,
  }) => {
    expect(await cardBackgrounds(page, name, 'sameList', mixed)).toEqual({
      nested: OVERRIDDEN.dark,
      inherited: OVERRIDDEN.light,
    });
  });

  test(`${name}: an override on :root alone does not reach a nested scope that sets its own`, async ({
    page,
  }) => {
    expect(await cardBackgrounds(page, name, 'rootOnly', mixed)).toEqual({
      nested: tokenColour('--card', 'dark'),
      inherited: OVERRIDDEN.light,
    });
  });

  test(`${name}: an override on :root alone does apply when the dark scope is the root`, async ({
    page,
  }) => {
    const darkRoot: Scope = { theme: 'dark', kids: [{}] };
    const html = pageHtml(
      darkRoot,
      FORM_KIND[name],
      builtCss(name, 'rootOnly'),
    );
    await open(page, html, 'light');
    expect((await readColours(page, '#s0')).background).toBe(OVERRIDDEN.dark);
  });
}

for (const name of FORM_NAMES) {
  definePageTests(name);
  defineOverrideTests(name);
}
