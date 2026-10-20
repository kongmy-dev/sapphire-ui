export const tokenRenames = {
  '--color-primary': '--primary',
  '--color-primary-hover': '--primary-hover',
  '--color-accent': '--brand',
  '--color-accent-dark': '--brand-hover',
  '--color-accent-text': '--brand-text',
  '--color-accent-on-fill': '--brand-on-fill',
  '--color-surface': '--background',
  '--color-text-main': '--foreground',
  '--color-text-strong': '--foreground-strong',
  '--color-text-muted': '--muted-foreground',
  '--color-text-on-dark': '--on-dark',
  '--color-text-on-dark-muted': '--on-dark-muted',
  '--color-success': '--success',
  '--color-success-bg': '--success-bg',
  '--color-success-border': '--success-border',
  '--color-error': '--error',
  '--color-error-hover': '--error-hover',
  '--color-error-ring': '--error-ring',
  '--color-error-bg': '--error-bg',
  '--color-error-border': '--error-border',
  '--color-warning': '--warning',
  '--color-warning-bg': '--warning-bg',
  '--color-warning-border': '--warning-border',
  '--color-info': '--info',
  '--color-info-bg': '--info-bg',
  '--color-info-border': '--info-border',
  '--color-border': '--border',
  '--color-border-strong': '--border-strong',
  '--color-border-dark': '--border-dark',
  '--color-hover-overlay': '--accent',
  '--color-focus-ring': '--ring',
  '--color-white': '--white',
  '--color-card-bg': '--card',
  '--color-card-dark-bg': '--card-dark',
  '--font-serif': '--font-serif',
  '--font-sans': '--font-sans',
  '--font-mono': '--font-mono',
  '--text-display-xl': '--text-display-xl',
  '--text-display': '--text-display',
  '--text-heading': '--text-heading',
  '--text-subheading': '--text-subheading',
  '--text-lg': '--text-lg',
  '--text-base': '--text-base',
  '--text-sm': '--text-sm',
  '--text-xs': '--text-xs',
  '--leading-tight': '--leading-tight',
  '--leading-snug': '--leading-snug',
  '--leading-normal': '--leading-normal',
  '--leading-relaxed': '--leading-relaxed',
  '--space-1': '--space-1',
  '--space-2': '--space-2',
  '--space-3': '--space-3',
  '--space-4': '--space-4',
  '--space-5': '--space-5',
  '--space-6': '--space-6',
  '--space-8': '--space-8',
  '--space-10': '--space-10',
  '--space-12': '--space-12',
  '--space-16': '--space-16',
  '--space-24': '--space-24',
  '--space-32': '--space-32',
  '--radius-sm': '--radius-sm',
  '--radius-md': '--radius-md',
  '--radius-btn': '--radius-btn',
  '--radius-pill': '--radius-pill',
  '--shadow-sm': '--shadow-sm',
  '--shadow-md': '--shadow-md',
  '--shadow-lg': '--shadow-lg',
  '--shadow-card-hover': '--shadow-card-hover',
  '--transition-fast': '--transition-fast',
  '--transition-base': '--transition-base',
  '--transition-slow': '--transition-slow',
  '--color-background': '--background',
  '--color-foreground': '--foreground',
  '--color-card': '--card',
  '--color-card-foreground': '--card-foreground',
  '--color-popover': '--popover',
  '--color-popover-foreground': '--popover-foreground',
  '--color-primary-foreground': '--primary-foreground',
  '--color-secondary': '--secondary',
  '--color-secondary-foreground': '--secondary-foreground',
  '--color-muted': '--muted',
  '--color-muted-foreground': '--muted-foreground',
  '--color-accent-foreground': '--brand-foreground',
  '--color-destructive': '--destructive',
  '--color-destructive-foreground': '--destructive-foreground',
  '--color-success-foreground': '--success-foreground',
  '--color-warning-foreground': '--warning-foreground',
  '--color-info-foreground': '--info-foreground',
  '--color-input': '--input',
  '--color-ring': '--ring',
  '--color-sidebar': '--sidebar',
  '--color-sidebar-foreground': '--sidebar-foreground',
  '--color-sidebar-primary': '--sidebar-primary',
  '--color-sidebar-primary-foreground': '--sidebar-primary-foreground',
  '--color-sidebar-accent': '--sidebar-accent',
  '--color-sidebar-accent-foreground': '--sidebar-accent-foreground',
  '--color-sidebar-border': '--sidebar-border',
  '--color-sidebar-ring': '--sidebar-ring',
  '--color-chart-1': '--chart-1',
  '--color-chart-2': '--chart-2',
  '--color-chart-3': '--chart-3',
  '--color-chart-4': '--chart-4',
  '--color-chart-5': '--chart-5',
  '--radius-lg': '--radius',
  '--radius-xl': '--radius-xl',
  '--bg-page': '--background',
  '--bg-card': '--card',
  '--bg-dark': '--primary',
  '--bg-accent': '--brand',
  '--fg-primary': '--foreground',
  '--fg-secondary': '--muted-foreground',
  '--fg-on-dark': '--on-dark',
  '--fg-accent': '--brand',
  '--interactive-primary': '--brand',
  '--interactive-hover': '--brand-hover',
  '--interactive-focus': '--ring',
} as const;

export const newTokens = [
  '--accent-foreground',
  '--error-text',
  '--success-text',
  '--warning-text',
  '--info-text',
  '--field-dark',
  '--switch-off',
  '--border-width',
  '--border-width-strong',
  '--ring-width',
  '--ring-offset',
  '--page-width',
] as const;

export const utilityRenames = {
  color: {
    accent: 'brand',
    'accent-dark': 'brand-hover',
    'accent-text': 'brand-text',
    'accent-on-fill': 'brand-on-fill',
    'accent-foreground': 'brand-foreground',
    surface: 'background',
    'text-main': 'foreground',
    'text-strong': 'foreground-strong',
    'text-muted': 'muted-foreground',
    'text-on-dark': 'on-dark',
    'text-on-dark-muted': 'on-dark-muted',
    'hover-overlay': 'accent',
    'focus-ring': 'ring',
    'card-bg': 'card',
    'card-dark-bg': 'card-dark',
  },
} as const;

export { classRenames } from './class-map.js';

export const variableRenames = {
  '--switch-active': '--sp-switch-active',
  '--switch-inactive': '--sp-switch-inactive',
  '--toast-accent': '--sp-toast-accent',
  '--stack-gap': '--sp-stack-gap',
  '--cluster-gap': '--sp-cluster-gap',
  '--cluster-justify': '--sp-cluster-justify',
} as const;

export const unmappedClasses = {
  '.t-display':
    'display typography moves to the semantic h2 base rule or consumer utilities using --text-display; no sp-* typography class is shipped',
  '.t-heading':
    'heading typography moves to the semantic h3 base rule or consumer utilities using --text-heading; no sp-* typography class is shipped',
  '.t-subheading':
    'subheading typography moves to the semantic h4 base rule or consumer utilities using --text-subheading; no sp-* typography class is shipped',
  '.t-body':
    'body typography is inherited from the base body and p rules; remove this helper after checking the element context',
  '.t-body-sm':
    'small muted copy uses consumer CSS with --text-sm and --muted-foreground; the base p rule intentionally stays body-sized',
  '.t-body-lg':
    'large copy uses consumer CSS with --text-lg; there is no global sp-* type-scale utility',
  '.t-eyebrow':
    'uppercase tracked labels use --text-xs and consumer CSS; .sp-document-eyebrow has document-specific spacing and is not a general replacement',
  '.t-mono':
    'monospace copy uses --font-mono and --text-sm in consumer CSS; semantic code also receives component-specific styling',
  '.status-radio':
    'the enabled/disabled status dot has no standalone v4 component; choose a labelled .sp-badge status instead of retaining a colour-only indicator',
  '.enabled':
    'a modifier of .status-radio; represent the enabled status in text and choose a badge variant in the consuming markup',
  '.disabled':
    'a modifier of .status-radio, not the native disabled state; represent the disabled status in text and choose a badge variant',
  '.feature-badge':
    'a monospace feature pill with different casing and padding from .sp-badge; compose .sp-badge and consumer typography after reviewing its content',
  '.material-symbols-outlined':
    'font ligature text must be replaced with the corresponding Lucide SVG carrying .sp-icon; a class rename cannot replace its text node',
  '.collapsed':
    'the admin sidebar collapses with data-collapsed on .sp-admin-layout-sidebar; the class migrator cannot attach a state-only attribute',
  '.is-active':
    'admin links use aria-current=page and tab triggers use data-state=active; select the attribute from the element role',
  '.who':
    'the admin sidebar user-name and role wrapper has no public component part; compose consumer markup inside .sp-admin-layout-sidebar-footer',
  '.ct':
    'a count inside .sf-tab; v4 tab triggers accept composed badge content and have no count-specific part',
  '.archived':
    'an admin status pill with a special mixed muted fill; use a labelled .sp-badge and review whether its default muted styling is sufficient',
  '.show':
    'the modal overlay opens with data-state=open on .sp-dialog-overlay; visibility is an attribute state and cannot be migrated as a standalone class',

  '.is-hidden':
    'a modifier of .gate alone; the passphrase gate hides with data-hidden, an attribute no class stands for',
  '.is-visible':
    'a toast opens with [data-state=open] or [data-open] on .sp-toast, an attribute no class stands for',
  '.cq-sm':
    'a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from]',
  '.cq-md':
    'a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from]',
  '.cq-lg':
    'a container query helper that applies one utility from a width up; Tailwind apps use its @container variants and plain HTML uses .sp-columns[data-from]',
  '.locked':
    'a modifier of the admin shell .sf-pill; inside .doc-bar the pair is .sp-document-pill, a compound the class map cannot express',
  '.bar-row':
    'a horizontal share bar with a label, a track and a value; the bar chart draws vertical columns, so no part of it fits',
  '.bar': 'the track of .bar-row, which has no v4 home (see .bar-row)',
  '.lbl':
    'the label of .bar-row and of .sf-stat, neither of which one v4 class replaces (see .bar-row and .sf-stat)',
  '.v': 'the value of .bar-row and of .sf-stat, neither of which one v4 class replaces (see .bar-row and .sf-stat)',
  '.accent':
    'the gold fill of a .bar-row track, which has no v4 home (see .bar-row)',
  '.sf-mark':
    'the brand mark tile; it is .sp-document-mark in the document bar, foot and proposal layout and .sp-passphrase-gate-mark in the gate, so the class map cannot pick one',
  '.sf-wm':
    'the admin brand wordmark; .sp-admin-layout-brand takes any content and has no wordmark part',
  '.sf-tag':
    'the version tag in the admin brand; .sp-admin-layout-brand has no tag part',
  '.sf-spacer':
    'a flex spacer in the top bar; .sp-admin-layout-header spaces its start and end itself',
  '.sf-stat':
    'a stat in a bordered card; v4 puts .sp-stat inside .sp-card, two elements the class map cannot express',
  '.sf-type-tag':
    'the document type tag in the admin table; the admin layout shows the type with .sp-admin-layout-doc-icon[data-kind] and has no tag part',
} as const;

export const propValueRenames = {
  IconMark: {
    variant: { dark: 'on-dark' },
  },
  Button: {
    variant: { accent: 'brand' },
  },
  Badge: {
    variant: { accent: 'brand', dark: 'on-dark' },
  },
  Chip: {
    variant: { accent: 'brand' },
  },
  Input: {
    variant: { dark: 'on-dark' },
  },
  Textarea: {
    variant: { dark: 'on-dark' },
  },
  NativeSelect: {
    variant: { dark: 'on-dark' },
  },
  Alert: {
    variant: { accent: 'brand' },
  },
  Spinner: {
    tone: { accent: 'brand' },
  },
  Banner: {
    variant: { accent: 'brand' },
  },
} as const;

export const subpathRenames = {
  'toggle-switch': 'switch',
} as const;

export const manualApiChanges = {
  ThemeToggle: {
    asChild:
      'Remove asChild; ThemeToggle owns its icon children and always renders a button',
  },
  Icon: {
    name: 'Replace font glyph names with a React SVG element; no Icon name registry is exported',
    filled: 'Filled font glyphs are removed; choose explicit SVG geometry',
  },
  Button: { icon: 'Replace a string glyph with a React SVG element' },
  IconMark: {
    icon: 'Replace a string glyph with a React SVG element',
    filled: 'Filled font glyphs are removed; choose explicit SVG geometry',
  },
  Badge: { icon: 'Replace a string glyph with a React SVG element' },
  Chip: { icon: 'Replace a string glyph with a React SVG element' },
  Alert: { icon: 'Replace a string glyph with a React SVG element' },
  Banner: { icon: 'Replace a string glyph with a React SVG element' },
} as const;

export const manualFunctionChanges = {
  useLocalStorage:
    'Pass an explicit (unknown) => T parser as the third argument; throw to reject invalid stored JSON, and allow undefined only when T includes it',
} as const;
