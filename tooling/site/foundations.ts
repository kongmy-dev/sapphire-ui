import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveSheet, tokenSheet } from '../source/token-values';
import { code, escapeHtml, table } from './html';

const colourGroups = [
  [
    'Brand',
    [
      'primary',
      'primary-hover',
      'brand',
      'brand-hover',
      'brand-text',
      'brand-on-fill',
      'brand-foreground',
      'on-dark',
    ],
  ],
  [
    'Surfaces and text',
    [
      'background',
      'foreground',
      'foreground-strong',
      'muted-foreground',
      'card',
      'popover',
      'muted',
      'accent',
      'border',
      'border-strong',
      'input',
      'ring',
    ],
  ],
  [
    'Status',
    [
      'success',
      'success-text',
      'success-bg',
      'error',
      'error-text',
      'error-bg',
      'warning',
      'warning-text',
      'warning-bg',
      'info',
      'info-text',
      'info-bg',
    ],
  ],
  [
    'Charts and sidebar',
    [
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
      'chart-5',
      'sidebar',
      'sidebar-foreground',
      'sidebar-primary',
      'sidebar-accent',
      'sidebar-border',
    ],
  ],
] as const;
const fonts = [
  [
    'serif',
    'Newsreader',
    'Editorial headings and brand character. Weights 500–600.',
  ],
  [
    'sans',
    'Source Sans 3',
    'Body copy, controls and navigation. Weights 400–600.',
  ],
  ['mono', 'JetBrains Mono', 'Code, identifiers and technical metadata.'],
] as const;
const scale = [
  ['display-xl', 'serif', '600', 'A clear point of view.'],
  ['display', 'serif', '600', 'Make room for the idea.'],
  ['heading', 'serif', '500', 'Editorial character, useful detail.'],
  ['subheading', 'serif', '500', 'A considered next step.'],
  ['lg', 'sans', '400', 'A larger introduction to the work.'],
  ['base', 'sans', '400', 'Readable body text carries the explanation.'],
  ['sm', 'sans', '400', 'Secondary details and supporting information.'],
  ['xs', 'sans', '600', 'TECHNICAL META · SECTION LABEL'],
] as const;

function section(id: string, title: string, body: string) {
  return `<section class="docs-section" id="${id}"><h2>${title}</h2>${body}</section>`;
}

function swatch(
  name: string,
  light: ReadonlyMap<string, string>,
  dark: ReadonlyMap<string, string>,
) {
  const token = `--${name}`;
  return `<figure class="docs-swatch"><div class="docs-swatch-pair" aria-hidden="true"><span data-theme="light" style="background:linear-gradient(var(${token}),var(${token})),var(--background)"></span><span data-theme="dark" style="background:linear-gradient(var(${token}),var(${token})),var(--background)"></span></div><figcaption><strong>${name.split('-').join(' ')}</strong><code>${token}</code><span>Light <code>${escapeHtml(light.get(token) ?? '')}</code></span><span>Dark <code>${escapeHtml(dark.get(token) ?? '')}</code></span><button type="button" class="docs-copy" data-copy="${token}" aria-label="Copy ${token} token">Copy token</button></figcaption></figure>`;
}

function colours(
  light: ReadonlyMap<string, string>,
  dark: ReadonlyMap<string, string>,
) {
  return `<p class="docs-lead">Navy for structure. Gold for emphasis. Semantic colours keep surfaces, text and feedback readable in both schemes.</p><p>Every swatch shows light on the left and dark on the right. Values resolve from the current token stylesheet. Copy a token name to use it in your CSS.</p><p id="docs-copy-status" role="status" class="docs-copy-status">Select a token to copy its name.</p>${colourGroups.map(([title, names]) => section(title.toLowerCase().replaceAll(' ', '-'), title, `<div class="docs-swatch-grid">${names.map((name) => swatch(name, light, dark)).join('')}</div>`)).join('')}${section('colour-usage', 'Using colour', `<p>Use <code>--brand-text</code> for gold text on light surfaces. <code>--brand</code> is a decorative fill; navy actions use <code>--primary-foreground</code> for their text. Status text uses the <code>-text</code> token rather than the solid fill.</p>${code('.notice {\n  color: var(--success-text);\n  background: var(--success-bg);\n}')}<p><a href="/tokens/">Theme scopes and token overrides →</a></p>`)}`;
}

function typography(values: ReadonlyMap<string, string>) {
  return `<p class="docs-lead">Three families, one hierarchy. Newsreader gives headings their editorial character; Source Sans 3 keeps the interface readable; JetBrains Mono carries technical detail.</p>${section('families', 'Font families', `<div class="docs-type-families">${fonts.map(([key, name, usage]) => `<article class="docs-type-card"><h3 style="font-family:var(--font-${key})">${name}</h3><code>--font-${key}</code><p>${usage}</p><p class="docs-glyphs" style="font-family:var(--font-${key})">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br>abcdefghijklmnopqrstuvwxyz 0123456789</p></article>`).join('')}</div>`)}${section('type-scale', 'Type scale', `<p>Headings use fluid sizes; the exact token values below stay in sync with the stylesheet. Body text stays readable when layouts become denser.</p><div class="docs-type-scale">${scale.map(([key, family, weight, sample]) => `<figure class="docs-type-card"><figcaption><code>--text-${key}</code><span>${escapeHtml(values.get(`--text-${key}`) ?? '')} · ${weight} · ${family}</span></figcaption><p class="docs-type-sample" style="font: ${weight} var(--text-${key})/var(--leading-tight) var(--font-${family})">${sample}</p></figure>`).join('')}</div>`)}${section(
    'reading-rhythm',
    'Reading rhythm',
    `${table(
      'Line heights',
      ['Token', 'Value', 'Use'],
      [
        ['tight', 'Headings'],
        ['snug', 'Compact UI'],
        ['normal', 'Body copy'],
        ['relaxed', 'Long-form reading'],
      ].map(([key = '', use = '']) => [
        `<code>--leading-${key}</code>`,
        escapeHtml(values.get(`--leading-${key}`) ?? ''),
        use,
      ]),
    )}<p>Use a restrained heading hierarchy and a comfortable line length. Don’t shrink body text to make a screen feel compact.</p><p><a href="/prose/">See a complete prose specimen →</a></p>`,
  )}`;
}

function tokens() {
  return `<p class="docs-lead">Semantic tokens are the shared contract for CSS, React and native HTML. Foundations load fonts, tokens, base styles and layout primitives once.</p>${section('theme-scopes', 'Theme scopes', `<p>Set <code>data-theme="light"</code> or <code>data-theme="dark"</code> on the document or a section. Omit it to follow the system preference; <code>.dark</code> also forces dark.</p><div class="docs-theme-pair">${['light', 'dark'].map((theme) => `<article class="sp-card sp-stack" data-theme="${theme}"><h3>${theme === 'light' ? 'Light' : 'Dark'} surface</h3><p>The same semantic tokens choose a readable surface and foreground.</p><button class="sp-button" type="button">Primary action</button></article>`).join('')}</div>`)}${section('overrides', 'Customise the system', `<p>Override colours on every theme scope so nested sections keep your theme. Using only <code>:root</code> does not override a section that declares its own theme.</p>${code(':root, [data-theme="light"], [data-theme="dark"], .dark {\n  --brand: light-dark(#c5a065, #c5a065);\n}')}<p><a href="/colors/">Browse colours and resolved values</a> · <a href="/typography/">Browse typography</a> · <a href="/spacing/">Spacing, shape and elevation</a></p>`)}`;
}

function spacing(values: ReadonlyMap<string, string>) {
  const spaces = [...values].filter(([name]) => /^--space-/.test(name));
  const radii = [...values].filter(([name]) => /^--radius/.test(name));
  const shadows = ['sm', 'md', 'lg', 'card-hover'];
  return `<p class="docs-lead">A 4px spacing grid, modest rounding and deliberate elevation. Group related information without shrinking readable text.</p>${section('spacing-scale', 'Spacing scale', `<div class="docs-space-scale">${spaces.map(([name, value]) => `<div><code>${name}</code><span class="docs-space-bar" style="width:var(${name})" aria-hidden="true"></span><span>${escapeHtml(value)}</span></div>`).join('')}</div>`)}${section('shape', 'Shape', `<div class="docs-shape-grid">${radii.map(([name, value]) => `<figure class="docs-shape" style="border-radius:var(${name})"><figcaption><code>${name}</code><span>${escapeHtml(value)}</span></figcaption></figure>`).join('')}</div>`)}${section('elevation', 'Elevation', `<p>Depth starts with surface contrast. Use shadows for raised panels and overlays, with hover lift on interactive cards.</p><div class="docs-shape-grid">${shadows.map((name) => `<figure class="docs-shape" style="box-shadow:var(--shadow-${name})"><figcaption><code>--shadow-${name}</code></figcaption></figure>`).join('')}</div>`)}${section('density', 'Control density', '<p>Default buttons and fields align at 36px with a fine pointer. Coarse pointers keep at least 44px targets. Labels, help text and focus indicators need space even in a compact layout.</p>')}`;
}

const layout = `<div class="sp-columns" data-columns="2" data-from="md"><article class="sp-card sp-stack"><h3>Related content</h3><p>A stack keeps related content together.</p><div class="sp-cluster"><button class="sp-button">Continue</button><button class="sp-button" data-variant="outline">Cancel</button></div></article><article class="sp-card sp-stack"><h3>A second column</h3><p>Columns share the available width. Add data-from="md" inside sp-cq to stack them on narrow screens.</p></article></div>`;
const prose = `<article class="sp-prose"><h3>Make room for the idea</h3><p>Readable typography supports the work. <strong>Use emphasis sparingly</strong>, and give the main action a clear place.</p><h4>Build a steady rhythm</h4><ul><li>Group related content.</li><li>Keep headings descriptive.</li><li>Use the right element for the job.</li></ul><blockquote><p>Clarity comes from choosing what belongs together.</p></blockquote><p><a href="/components/prose/">Explore all prose examples</a>.</p></article>`;

export function foundationGuides(root: string) {
  const sheet = tokenSheet(readFileSync(join(root, 'css/tokens.css'), 'utf8'));
  const light = resolveSheet(sheet, 'light');
  const dark = resolveSheet(sheet, 'dark');
  return [
    { route: 'colors', title: 'Colors', body: colours(light, dark) },
    { route: 'typography', title: 'Typography', body: typography(light) },
    { route: 'spacing', title: 'Spacing and shape', body: spacing(light) },
    { route: 'tokens', title: 'Tokens and themes', body: tokens() },
    {
      route: 'layout',
      title: 'Layout primitives',
      body: `<p class="docs-lead">Stack, cluster and columns compose with the page container. These primitives ship in foundations.</p>${section('composition', 'Compose a layout', layout)}${section('layout-usage', 'Usage', code(layout))}`,
    },
    {
      route: 'prose',
      title: 'Prose',
      body: `<p class="docs-lead">Editorial typography for articles, proposals and long-form content.</p>${section('prose-specimen', 'Reading specimen', prose)}${section('prose-setup', 'Setup', code('import "@kongmy-dev/sapphire-ui/prose.css";'))}`,
    },
  ];
}
