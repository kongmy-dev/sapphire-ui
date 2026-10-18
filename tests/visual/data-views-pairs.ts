export const HOLDER = '#parity';
export const GROUPS = ['tabs', 'table', 'bar-chart', 'sparkline'] as const;
export const SPECIMENS = {
  tabs: 'components/tabs/tabs.examples.html',
  table: 'components/table/table.examples.html',
  'bar-chart': 'components/bar-chart/bar-chart.examples.html',
  sparkline: 'components/sparkline/sparkline.examples.html',
} as const;

type Group = (typeof GROUPS)[number];
type Interaction = 'rest' | 'hover' | 'focus';
export type Pair = {
  name: string;
  group: Group;
  v3: string;
  v4: string;
  interaction: Interaction;
  target: string;
  observe: readonly string[];
  scroll: string;
};
export type Side = 'v3' | 'v4';

const V3_TRIGGER_BASE =
  'inline-flex cursor-pointer items-center gap-2 font-sans outline-none transition-all hover:text-(--color-text-strong) focus-visible:ring-(--color-focus-ring) focus-visible:ring-2 focus-visible:ring-offset-0';
const V3_TRIGGER = {
  underline: `${V3_TRIGGER_BASE} font-medium text-sm text-muted-foreground -mb-px border-transparent border-b-2 px-4 py-3 data-[state=active]:border-accent data-[state=active]:text-accent-text data-[orientation=vertical]:-mr-px data-[orientation=vertical]:mb-0 data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-[orientation=vertical]:whitespace-normal data-[orientation=vertical]:border-r-2 data-[orientation=vertical]:border-b-0 data-[orientation=vertical]:text-left`,
  pills: `${V3_TRIGGER_BASE} font-medium text-sm text-muted-foreground rounded-md px-3 py-2 hover:bg-background data-[state=active]:bg-accent/10 data-[state=active]:text-accent-text`,
  dashboard: `${V3_TRIGGER_BASE} rounded-md px-3.5 py-[7px] font-semibold text-[13px] text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white`,
} as const;
const V3_LIST = {
  underline:
    'flex gap-0 border-border border-b data-[orientation=vertical]:flex-col data-[orientation=vertical]:border-r data-[orientation=vertical]:border-b-0',
  pills: 'flex flex-wrap gap-1 data-[orientation=vertical]:flex-col',
  dashboard: 'flex gap-0.5',
} as const;

type Variant = keyof typeof V3_LIST;
type Orientation = 'horizontal' | 'vertical';

const TAB_LABELS = ['Overview', 'Accounts', 'Settings'] as const;

const trigger = (
  classes: string,
  orientation: Orientation,
  label: string,
  index: number,
) => {
  const state = index === 0 ? 'active' : 'inactive';
  return `<button type="button" role="tab" class="${classes}" data-state="${state}" data-orientation="${orientation}">${label}</button>`;
};

const tabsMarkup = (
  rootClass: string,
  listClass: string,
  variant: Variant,
  orientation: Orientation,
  triggerClass: string,
) => {
  const triggers = TAB_LABELS.map((label, index) =>
    trigger(triggerClass, orientation, label, index),
  ).join('');
  return `<div class="${rootClass}" data-orientation="${orientation}"><div role="tablist" class="${listClass}" data-variant="${variant}" data-orientation="${orientation}">${triggers}</div></div>`;
};

function v3Tabs(variant: Variant, orientation: Orientation) {
  const vertical = orientation === 'vertical';
  const root = vertical ? 'flex min-h-[150px]' : '';
  const list = vertical
    ? `${V3_LIST[variant]} w-48 shrink-0`
    : V3_LIST[variant];
  return tabsMarkup(root, list, variant, orientation, V3_TRIGGER[variant]);
}

function v4Tabs(variant: Variant, orientation: Orientation) {
  const root =
    orientation === 'vertical' ? 'sp-tabs docs-tabs-vertical' : 'sp-tabs';
  return tabsMarkup(
    root,
    'sp-tabs-list',
    variant,
    orientation,
    'sp-tabs-trigger',
  );
}

const TAB_OBSERVE = [
  '[role=tablist]',
  '[data-state=active]',
  '[data-state=inactive]',
] as const;

function tabPairs(
  variant: Variant,
  orientation: Orientation,
  cases: readonly [Interaction, string][],
): Pair[] {
  return cases.map(([interaction, state]) => ({
    name: `${variant}/${orientation}/${interaction}/${state || 'none'}`,
    group: 'tabs',
    v3: v3Tabs(variant, orientation),
    v4: v4Tabs(variant, orientation),
    interaction,
    target: state && `${HOLDER} [data-state=${state}]`,
    observe: TAB_OBSERVE,
    scroll: '',
  }));
}

const ALL_STATES: readonly [Interaction, string][] = [
  ['rest', ''],
  ['hover', 'inactive'],
  ['hover', 'active'],
  ['focus', 'inactive'],
  ['focus', 'active'],
];

const V3_ROW = 'border-border border-b transition-colors hover:bg-accent/5';
const V3_HEAD =
  'whitespace-nowrap border-border border-b bg-page px-4 py-3 text-left font-sans font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.08em]';
const V3_STICKY =
  'sticky top-0 z-10 bg-(--color-card-bg) shadow-[0_1px_0_0_var(--color-border)]';
const SERVICES = [
  ['Workers', 'Cloudflare'],
  ['Cloud Run', 'GCP'],
  ['S3', 'AWS'],
  ['Pub/Sub', 'GCP'],
  ['Lambda', 'AWS'],
  ['R2', 'Cloudflare'],
] as const;
const SCROLLER = '.scroller';

const tableRows = (row: string, cell: string) =>
  SERVICES.map(
    ([name, provider]) =>
      `<tr class="${row}"><td class="${cell}">${name}</td><td class="${cell}">${provider}</td></tr>`,
  ).join('');

const scrolling = (sticky: boolean, inner: string) =>
  sticky
    ? `<div class="scroller" style="max-height: 7.5rem; overflow: auto">${inner}</div>`
    : `<div>${inner}</div>`;

function v3Table(sticky: boolean) {
  const header = sticky ? V3_STICKY : '';
  const heads = ['Service', 'Provider']
    .map((label) => `<th class="${V3_HEAD}">${label}</th>`)
    .join('');
  const inner = `<div class="w-full overflow-auto"><table class="w-full border-collapse font-sans text-[14px]"><thead class="${header}"><tr class="${V3_ROW}">${heads}</tr></thead><tbody>${tableRows(V3_ROW, 'p-4')}</tbody></table></div>`;
  return scrolling(sticky, inner);
}

function v4Table(sticky: boolean) {
  const stuck = sticky ? ' data-sticky' : '';
  const heads = ['Service', 'Provider']
    .map((label) => `<th class="sp-table-head">${label}</th>`)
    .join('');
  const inner = `<div class="sp-table-container"><table class="sp-table"><thead class="sp-table-header"${stuck}><tr class="sp-table-row">${heads}</tr></thead><tbody>${tableRows('sp-table-row', 'sp-table-cell')}</tbody></table></div>`;
  return scrolling(sticky, inner);
}

const TABLE_OBSERVE = [
  'table',
  'thead',
  'thead tr',
  'th',
  'tbody tr',
  'td',
] as const;

const tablePair = (
  name: string,
  interaction: Interaction,
  target: string,
  sticky: boolean,
): Pair => ({
  name,
  group: 'table',
  v3: v3Table(sticky),
  v4: v4Table(sticky),
  interaction,
  target,
  observe: TABLE_OBSERVE,
  scroll: sticky ? SCROLLER : '',
});

const CHART = `${HOLDER} > div`;
const COLUMN = `${CHART} > div:nth-child(2)`;
const BAR = `${COLUMN} > div`;
const CHART_OBSERVE = [
  CHART,
  COLUMN,
  BAR,
  `${BAR} > div`,
  `${COLUMN} > span`,
] as const;
const SHARES = [45, 60, 35, 80] as const;
const V3_VALUE =
  'absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-sm bg-(--color-text-strong) px-1.5 py-0.5 font-mono text-[10px] text-surface opacity-0 shadow-sm transition-opacity group-hover:opacity-100';

const v3Column = (share: number, index: number) =>
  `<div class="group flex h-full flex-1 flex-col items-center justify-end gap-2"><div class="relative w-full rounded-t-sm bg-accent/30 transition-colors group-hover:bg-accent/50" style="height: ${share}%"><div class="${V3_VALUE}">${share}h</div></div><span class="mt-1 font-mono text-[10px] text-text-muted">M${index + 1}</span></div>`;

const v4Column = (share: number, index: number) =>
  `<div class="sp-bar-chart-column"><div class="sp-bar-chart-bar" style="--sp-bar-chart-share: ${share}%"><div class="sp-bar-chart-value">${share}h</div></div><span class="sp-bar-chart-label">M${index + 1}</span></div>`;

const v3BarChart = () =>
  `<div class="flex items-end gap-3 border-border border-b pt-4" style="height: 12rem">${SHARES.map(v3Column).join('')}</div>`;

const v4BarChart = () =>
  `<div class="sp-bar-chart">${SHARES.map(v4Column).join('')}</div>`;

const chartPair = (
  name: string,
  interaction: Interaction,
  target: string,
): Pair => ({
  name,
  group: 'bar-chart',
  v3: v3BarChart(),
  v4: v4BarChart(),
  interaction,
  target,
  observe: CHART_OBSERVE,
  scroll: '',
});

const STATUSES = ['success', 'warning', 'error', 'neutral', 'success'] as const;
const V3_STATUS_COLOUR = {
  success: '--color-success',
  warning: '--color-warning',
  error: '--color-error',
  neutral: '--color-border',
} as const;

const v3Bar = (status: keyof typeof V3_STATUS_COLOUR) =>
  `<div class="flex-1 cursor-help rounded-[2px] opacity-60 transition-colors hover:opacity-100" style="background-color: var(${V3_STATUS_COLOUR[status]})"></div>`;

const v4Bar = (status: keyof typeof V3_STATUS_COLOUR) =>
  `<div class="sp-sparkline-bar" data-status="${status}"></div>`;

const SPARK = `${HOLDER} > div`;
const SPARK_OBSERVE = [1, 2, 3, 4].map(
  (position) => `${SPARK} > div:nth-child(${position})`,
);

const sparkPair = (interaction: Interaction, target: string): Pair => ({
  name: `bars/${interaction}`,
  group: 'sparkline',
  v3: `<div class="flex w-full gap-1.5" style="height: 2rem">${STATUSES.map(v3Bar).join('')}</div>`,
  v4: `<div class="sp-sparkline">${STATUSES.map(v4Bar).join('')}</div>`,
  interaction,
  target,
  observe: [SPARK, ...SPARK_OBSERVE],
  scroll: '',
});

export const PAIRS: readonly Pair[] = [
  ...tabPairs('underline', 'horizontal', ALL_STATES),
  ...tabPairs('pills', 'horizontal', ALL_STATES),
  ...tabPairs('dashboard', 'horizontal', ALL_STATES),
  ...tabPairs('underline', 'vertical', ALL_STATES),
  ...tabPairs('pills', 'vertical', [
    ['rest', ''],
    ['hover', 'inactive'],
  ]),
  tablePair('rest', 'rest', '', false),
  tablePair(
    'hover-body-row',
    'hover',
    `${HOLDER} tbody tr:nth-child(2)`,
    false,
  ),
  tablePair('hover-head-row', 'hover', `${HOLDER} thead tr`, false),
  tablePair('sticky-header', 'rest', '', true),
  chartPair('rest', 'rest', ''),
  chartPair('hover-column', 'hover', COLUMN),
  sparkPair('rest', ''),
  sparkPair('hover', `${SPARK} > div:nth-child(2)`),
];
