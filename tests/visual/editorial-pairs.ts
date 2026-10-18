export const HOLDER = '#parity';
export const EXTENDED_SPECIMEN = 'components/callout/callout.examples.html';
export const STEPS_SPECIMEN = 'components/steps/steps.examples.html';
export const GLYPHS = [
  '.material-symbols-outlined',
  '.sp-callout-icon',
  '.sp-steps-icon',
].join(', ');

export type Interaction = 'rest' | 'hover' | 'focus';
export type Probe = {
  name: string;
  v3: string;
  v4: string;
  pseudo?: string;
  rectOnly?: boolean;
  skip?: readonly string[];
};

const same = (name: string, selector: string): Probe => ({
  name,
  v3: selector,
  v4: selector,
});
const pair = (name: string, v3: string, v4: string): Probe => ({
  name,
  v3,
  v4,
});

const MERGED_WRAPPER = [
  'position',
  'z-index',
  'top',
  'right',
  'bottom',
  'left',
] as const;

export const CALLOUT_PROBES: readonly Probe[] = [
  pair('callout', 'h3 + div', '.sp-callout'),
  {
    name: 'icon',
    v3: '.material-symbols-outlined',
    v4: '.sp-callout-icon',
    rectOnly: true,
  },
  pair(
    'title',
    'h3 + div > div:last-child > div:first-child',
    '.sp-callout-title',
  ),
  pair(
    'body',
    'h3 + div > div:last-child > div:last-child',
    '.sp-callout-body',
  ),
  same('list', 'ul'),
  same('first item', 'li:first-child'),
  same('last item', 'li:last-child'),
];

export const MARGIN_NOTE_PROBES: readonly Probe[] = [
  same('paragraph', 'p'),
  pair('note', 'p > span', '.sp-margin-note'),
  pair('anchor', 'p > span > span:nth-child(1)', '.sp-margin-note-anchor'),
  pair('inline note', 'p > span > span:nth-child(2)', '.sp-margin-note-inline'),
  pair('aside', 'p > span > span:nth-child(3)', '.sp-margin-note-aside'),
];

const timelineProbes = (
  v3Root: string,
  items: number,
  dots: boolean,
): Probe[] => {
  const rows = Array.from({ length: items }, (_, index) => index + 1);
  const root = pair('timeline', v3Root, '.sp-timeline');
  const parts = rows.flatMap((row) => {
    const v3Item = `${v3Root} > div:nth-child(${row})`;
    const v4Item = `.sp-timeline-item:nth-child(${row})`;
    const probes = [
      pair(`item ${row}`, v3Item, v4Item),
      pair(
        `indicator ${row}`,
        `${v3Item} > div:first-child`,
        `${v4Item} .sp-timeline-indicator`,
      ),
      pair(
        `marker ${row}`,
        `${v3Item} > div:first-child > div:first-child`,
        `${v4Item} .sp-timeline-marker`,
      ),
      pair(
        `content ${row}`,
        `${v3Item} > div:last-child`,
        `${v4Item} .sp-timeline-content`,
      ),
      pair(
        `title ${row}`,
        `${v3Item} > div:last-child > div:first-child`,
        `${v4Item} .sp-timeline-content > div:first-child`,
      ),
    ];
    if (row < items)
      probes.push({
        name: `connector ${row}`,
        v3: `${v3Item} > div:first-child > div:nth-child(2)`,
        v4: `${v4Item} .sp-timeline-indicator`,
        pseudo: '::after',
      });
    return probes;
  });
  const dot = dots
    ? [pair('dot', `${v3Root} .size-2`, '.sp-timeline-dot')]
    : [];
  return [root, ...parts, ...dot];
};

export const CARD_TIMELINE_PROBES = timelineProbes('h3 + div', 2, false);
export const TIMELINE_PROBES = timelineProbes(':scope > div', 3, true);

export const TOC_PROBES: readonly Probe[] = [
  pair('toc', 'h3 + nav', '.sp-toc'),
  pair('title', 'nav > p', '.sp-toc-title'),
  pair('list', 'ul', '.sp-toc-list'),
  pair('first item', 'li:nth-child(1)', '.sp-toc-item:nth-child(1)'),
  pair('first link', 'li:nth-child(1) a', '.sp-toc-item:nth-child(1) a'),
  pair('active link', 'li:nth-child(2) a', '.sp-toc-item:nth-child(2) a'),
  pair('indented item', 'li:nth-child(3)', '.sp-toc-item:nth-child(3)'),
  pair('indented link', 'li:nth-child(3) a', '.sp-toc-item:nth-child(3) a'),
];

const stepsProbes = (rows: number): Probe[] =>
  Array.from({ length: rows }, (_, index) => index + 1).flatMap((row) => {
    const v3Step = `li:nth-child(${row})`;
    const v4Step = `.sp-steps-step:nth-child(${row})`;
    const probes: Probe[] = [
      pair(`step ${row}`, v3Step, v4Step),
      {
        name: `indicator ${row}`,
        v3: `${v3Step} .z-10 > div`,
        v4: `${v4Step} .sp-steps-indicator`,
        skip: MERGED_WRAPPER,
      },
      pair(
        `text ${row}`,
        `${v3Step} > div:last-child`,
        `${v4Step} .sp-steps-text`,
      ),
      pair(
        `label ${row}`,
        `${v3Step} > div:last-child > span:first-child`,
        `${v4Step} .sp-steps-label`,
      ),
    ];
    if (row < rows)
      probes.push({
        name: `connector ${row}`,
        v3: `${v3Step} > div:first-child`,
        v4: v4Step,
        pseudo: '::after',
      });
    return probes;
  });

export const WIZARD_PROBES: readonly Probe[] = [
  pair('steps', 'nav', '.sp-steps'),
  pair('list', 'ol', '.sp-steps-list'),
  ...stepsProbes(3),
  ...Array.from({ length: 3 }, (_, index) =>
    pair(
      `description ${index + 1}`,
      `li:nth-child(${index + 1}) > div:last-child > span:last-child`,
      `.sp-steps-step:nth-child(${index + 1}) .sp-steps-description`,
    ),
  ),
];

export const COMPACT_STEPS_PROBES: readonly Probe[] = [
  pair('steps', 'nav', '.sp-steps'),
  ...stepsProbes(3),
];

const V3_CALLOUT = 'relative flex gap-4 rounded-md border p-5 font-sans';
const V3_CALLOUT_VARIANT = {
  default: 'border-border bg-surface text-text-main',
  subtle: 'border-transparent bg-surface/30 text-text-main',
} as const;
const V3_CALLOUT_ICON =
  'mt-0.5 flex shrink-0 items-start text-(--color-text-strong)';
const V3_CALLOUT_TITLE =
  'font-semibold font-serif text-lg text-text-strong tracking-tight';
const V3_CALLOUT_BODY =
  'text-sm/relaxed text-text-muted [&>ul]:ml-4 [&>ul]:list-disc [&>ul]:space-y-1';

type CalloutVariant = keyof typeof V3_CALLOUT_VARIANT;

export const v3Callout = (
  variant: CalloutVariant,
  parts: { icon: boolean; title: string; body: string },
) =>
  `<div class="${V3_CALLOUT} ${V3_CALLOUT_VARIANT[variant]}">${
    parts.icon
      ? `<div class="${V3_CALLOUT_ICON}"><span class="material-symbols-outlined text-[24px]" aria-hidden="true">bolt</span></div>`
      : ''
  }<div class="flex flex-1 flex-col gap-2">${
    parts.title ? `<div class="${V3_CALLOUT_TITLE}">${parts.title}</div>` : ''
  }<div class="${V3_CALLOUT_BODY}">${parts.body}</div></div></div>`;

export const v4Callout = (
  variant: CalloutVariant,
  parts: { icon: boolean; title: string; body: string },
) =>
  `<div class="sp-callout" data-variant="${variant}">${
    parts.icon ? '<span class="sp-callout-icon" aria-hidden="true"></span>' : ''
  }<div class="sp-callout-content">${
    parts.title ? `<div class="sp-callout-title">${parts.title}</div>` : ''
  }<div class="sp-callout-body">${parts.body}</div></div></div>`;

export const CALLOUT_LIST =
  '<ul><li>The default variant draws a border and a surface fill.</li><li>The subtle variant drops the border and fades the fill.</li></ul>';
export const CALLOUT_TEXT = 'A callout needs neither an icon nor a title.';

export const INJECTED_CALLOUT_PROBES: readonly Probe[] = [
  pair('callout', ':scope > div', '.sp-callout'),
  {
    name: 'icon',
    v3: '.material-symbols-outlined',
    v4: '.sp-callout-icon',
    rectOnly: true,
  },
  pair(
    'title',
    ':scope > div > div:last-child > div:first-child',
    '.sp-callout-title',
  ),
  pair(
    'body',
    ':scope > div > div:last-child > div:last-child',
    '.sp-callout-body',
  ),
  same('list', 'ul'),
  same('first item', 'li:first-child'),
  same('last item', 'li:last-child'),
];

export const BODY_ONLY_CALLOUT_PROBES: readonly Probe[] = [
  pair('callout', ':scope > div', '.sp-callout'),
  pair('body', ':scope > div > div > div', '.sp-callout-body'),
];

const TIMELINE_ITEMS = [
  ['v1.2.0 - Core Update', 'Added timeline primitive.'],
  ['v1.1.5 - Fixes', 'Default marker.'],
  ['v1.1.0 - Layouts', 'Added admin sidebar layout.'],
] as const;

type Orientation = 'vertical' | 'horizontal';

const V3_TIMELINE = {
  vertical: {
    root: 'flex font-sans flex-col',
    item: 'relative flex flex-row gap-4',
    indicator: 'relative flex shrink-0 items-center w-6 flex-col justify-start',
    connector: 'top-6 bottom-[-16px] left-1/2 w-[2px] -translate-x-1/2',
    content: 'pt-0.5 pb-8',
  },
  horizontal: {
    root: 'flex font-sans flex-row',
    item: 'relative flex flex-1 flex-col gap-3',
    indicator:
      'relative flex shrink-0 items-center h-6 flex-row justify-center',
    connector: 'top-1/2 right-[-12px] left-6 h-[2px] -translate-y-1/2',
    content: 'pr-8',
  },
} as const;
const V3_TIMELINE_MARKER =
  'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface text-text-muted';

export const v3Timeline = (orientation: Orientation) => {
  const classes = V3_TIMELINE[orientation];
  const items = TIMELINE_ITEMS.map(([title, note], index) => {
    const connector =
      index < TIMELINE_ITEMS.length - 1
        ? `<div class="absolute bg-border ${classes.connector}" aria-hidden="true"></div>`
        : '';
    return `<div class="${classes.item}"><div class="${classes.indicator}"><div class="${V3_TIMELINE_MARKER}"><span class="size-2 rounded-full bg-primary/40"></span></div>${connector}</div><div class="flex flex-col gap-1 ${classes.content}"><div class="font-semibold text-sm">${title}</div><div class="text-text-muted text-xs">${note}</div></div></div>`;
  }).join('');
  return `<div class="${classes.root}" data-orientation="${orientation}">${items}</div>`;
};

export const v4Timeline = (orientation: Orientation) => {
  const items = TIMELINE_ITEMS.map(
    ([title, note], index) =>
      `<div class="sp-timeline-item"><div class="sp-timeline-indicator"${
        index === TIMELINE_ITEMS.length - 1 ? ' data-last' : ''
      }><div class="sp-timeline-marker"><span class="sp-timeline-dot"></span></div></div><div class="sp-timeline-content"><div class="docs-timeline-title">${title}</div><div class="docs-timeline-note">${note}</div></div></div>`,
  ).join('');
  return `<div class="sp-timeline" data-orientation="${orientation}">${items}</div>`;
};

const V3_STEP_LABEL = {
  done: 'text-(--color-text-strong)',
  active: 'text-(--color-accent-text,var(--color-accent))',
  upcoming: 'text-text-muted',
} as const;
const V3_STEP_INDICATOR = {
  done: 'bg-primary text-text-on-dark',
  active: 'bg-accent text-primary ring-4 ring-accent/18',
  upcoming: 'border border-border bg-surface text-text-muted',
} as const;
const STEP_STATUSES = ['done', 'active', 'upcoming'] as const;
const STEP_LABELS = ['Region', 'Compute', 'Review'] as const;

export const v3CompactSteps = () => {
  const steps = STEP_STATUSES.map((status, index) => {
    const connector =
      index < STEP_STATUSES.length - 1
        ? `<div class="absolute top-3.5 h-[2px] right-[calc(-50%+16px)] left-[calc(50%+16px)] ${
            status === 'done' ? 'bg-(--color-text-strong)' : 'bg-border'
          }" aria-hidden="true"></div>`
        : '';
    const content =
      status === 'done'
        ? '<span class="material-symbols-outlined text-[16px]" aria-hidden="true">check</span>'
        : `${index + 1}`;
    return `<li class="relative flex flex-1 flex-col items-center text-center gap-1">${connector}<div class="relative z-10"><div class="flex size-7 items-center justify-center rounded-full font-mono font-semibold text-xs transition-colors ${V3_STEP_INDICATOR[status]}">${content}</div></div><div class="flex flex-col gap-0.5"><span class="font-semibold text-xs uppercase tracking-wider transition-colors ${V3_STEP_LABEL[status]}">${STEP_LABELS[index]}</span></div></li>`;
  }).join('');
  return `<nav aria-label="Progress" class="flex w-full font-sans"><ol class="m-0 flex w-full list-none gap-0 p-0">${steps}</ol></nav>`;
};

export const v4CompactSteps = () => {
  const steps = STEP_STATUSES.map((status, index) => {
    const content =
      status === 'done'
        ? '<span class="sp-steps-icon" aria-hidden="true"></span>'
        : `${index + 1}`;
    const current = status === 'active' ? ' aria-current="step"' : '';
    return `<li class="sp-steps-step" data-status="${status}"${current}><div class="sp-steps-indicator">${content}</div><div class="sp-steps-text"><span class="sp-steps-label">${STEP_LABELS[index]}</span></div></li>`;
  }).join('');
  return `<nav class="sp-steps" data-variant="compact" aria-label="Progress"><ol class="sp-steps-list">${steps}</ol></nav>`;
};

const NOTE =
  'This note appears in the margin on desktop and reflows inline on mobile devices.';
const PARAGRAPH =
  'When writing highly technical blog posts, we often need to reference external sources or explain a tangential concept without interrupting the main prose. Here is an example of a ';

export const v3MarginNote = () =>
  `<p class="text-sm/relaxed text-text-main" style="max-width:600px">${PARAGRAPH}<span class="group/note relative inline"><span class="cursor-help border-accent/50 border-b border-dashed transition-colors hover:border-accent hover:bg-accent/10" aria-describedby="mn-parity">Tufte-style margin note</span><span id="mn-parity" class="mt-2 block rounded-sm bg-surface p-3 text-sm text-text-muted lg:hidden">${NOTE}</span><span class="absolute top-0 left-[calc(100%+2rem)] hidden w-[240px] text-sm text-text-muted transition-colors group-hover/note:text-text-main lg:block" aria-hidden="true">${NOTE}</span></span> in action.</p>`;

export const v4MarginNote = () =>
  `<p class="docs-editorial-text">${PARAGRAPH}<span class="sp-margin-note"><span class="sp-margin-note-anchor" aria-describedby="mn-parity">Tufte-style margin note</span><span class="sp-margin-note-inline" id="mn-parity">${NOTE}</span><span class="sp-margin-note-aside" aria-hidden="true">${NOTE}</span></span> in action.</p>`;

export const INJECTED_MARGIN_NOTE_PROBES: readonly Probe[] = [
  same('paragraph', ':scope > p'),
  pair('note', ':scope > p > span', '.sp-margin-note'),
  pair(
    'anchor',
    ':scope > p > span > span:nth-child(1)',
    '.sp-margin-note-anchor',
  ),
  pair(
    'inline note',
    ':scope > p > span > span:nth-child(2)',
    '.sp-margin-note-inline',
  ),
  pair(
    'aside',
    ':scope > p > span > span:nth-child(3)',
    '.sp-margin-note-aside',
  ),
];
