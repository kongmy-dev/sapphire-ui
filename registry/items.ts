// Source of truth for the Sapphire UI product registry lane.
// Each entry maps a library component (PascalCase source in src/components/ui)
// to a shadcn-format registry item. npm `dependencies` and `registryDependencies`
// are DERIVED from each file's imports by scripts/build-registry.ts — declare
// only metadata here.
//
// Editorial-only components (MarginNote, ProposalLayout, SEOHead, …) are NOT
// listed: they stay npm-only. See REGISTRY-PLAN.md.

export interface RegistryItemConfig {
  /** kebab-case registry name (also the served file: /r/<name>.json). */
  name: string;
  /** PascalCase source file in src/components/ui (without extension). */
  source: string;
  /** Human title surfaced by the shadcn CLI. */
  title: string;
  description: string;
}

export const productItems: RegistryItemConfig[] = [
  {
    name: 'button',
    source: 'Button',
    title: 'Button',
    description: 'Primary action button with variant and size options.',
  },
  {
    name: 'icon',
    source: 'Icon',
    title: 'Icon',
    description: 'Material Symbols icon wrapper.',
  },
  {
    name: 'input',
    source: 'Input',
    title: 'Input',
    description: 'Text input with sapphire form styling.',
  },
  {
    name: 'textarea',
    source: 'Textarea',
    title: 'Textarea',
    description: 'Multi-line text input.',
  },
  {
    name: 'label',
    source: 'Label',
    title: 'Label',
    description: 'Accessible form label.',
  },
  {
    name: 'separator',
    source: 'Separator',
    title: 'Separator',
    description: 'Visual or semantic divider (Radix).',
  },
  {
    name: 'checkbox',
    source: 'Checkbox',
    title: 'Checkbox',
    description: 'Checkbox built on Radix.',
  },
  {
    name: 'radio-group',
    source: 'RadioGroup',
    title: 'Radio Group',
    description: 'Radio group built on Radix.',
  },
  {
    name: 'select',
    source: 'Select',
    title: 'Select',
    description: 'Select menu built on Radix.',
  },
  {
    name: 'native-select',
    source: 'NativeSelect',
    title: 'Native Select',
    description: 'Styled native <select>.',
  },
  {
    name: 'dialog',
    source: 'Dialog',
    title: 'Dialog',
    description: 'Modal dialog built on Radix.',
  },
  {
    name: 'sheet',
    source: 'Sheet',
    title: 'Sheet',
    description: 'Side sheet / drawer built on Radix Dialog.',
  },
  {
    name: 'dropdown-menu',
    source: 'DropdownMenu',
    title: 'Dropdown Menu',
    description: 'Dropdown menu built on Radix.',
  },
  {
    name: 'popover',
    source: 'Popover',
    title: 'Popover',
    description: 'Popover built on Radix.',
  },
  {
    name: 'tooltip',
    source: 'Tooltip',
    title: 'Tooltip',
    description: 'Tooltip built on Radix.',
  },
  {
    name: 'table',
    source: 'Table',
    title: 'Table',
    description: 'Table primitives.',
  },
  {
    name: 'tabs',
    source: 'Tabs',
    title: 'Tabs',
    description: 'Tabs built on Radix.',
  },
  {
    name: 'card',
    source: 'Card',
    title: 'Card',
    description: 'Card container with header/body/footer.',
  },
  {
    name: 'badge',
    source: 'Badge',
    title: 'Badge',
    description: 'Status/label badge.',
  },
  {
    name: 'form-field',
    source: 'FormField',
    title: 'Form Field',
    description: 'Label + control + error composition.',
  },
  {
    name: 'skeleton',
    source: 'Skeleton',
    title: 'Skeleton',
    description: 'Loading placeholder.',
  },
  {
    name: 'spinner',
    source: 'Spinner',
    title: 'Spinner',
    description: 'Loading spinner.',
  },
  {
    name: 'empty',
    source: 'Empty',
    title: 'Empty',
    description: 'Empty-state block.',
  },
  {
    name: 'pagination',
    source: 'Pagination',
    title: 'Pagination',
    description: 'Pagination controls.',
  },
  {
    name: 'stat',
    source: 'Stat',
    title: 'Stat',
    description: 'Single KPI stat.',
  },
  {
    name: 'stat-group',
    source: 'StatGroup',
    title: 'Stat Group',
    description: 'Grid of Stat items.',
  },
];

export interface RegistryBlockConfig {
  /** kebab-case registry name (served at /r/<name>.json). */
  name: string;
  /** Source file in registry/blocks (with extension). */
  file: string;
  title: string;
  description: string;
}

// Admin blocks (Phase C) — restyled from an external shadcn admin template onto
// Sapphire tokens. They compose Sapphire primitives via `@/` and bring their own
// npm deps (sonner/cmdk/lucide), which stay devDeps here + land in the consumer
// on `shadcn add`. Sources live outside src/ so the npm lane never bundles them.
export const productBlocks: RegistryBlockConfig[] = [
  {
    name: 'toaster',
    file: 'sonner.tsx',
    title: 'Toaster',
    description: 'Product-lane toast (sonner) wired to Sapphire tokens.',
  },
  {
    name: 'command',
    file: 'command.tsx',
    title: 'Command',
    description: 'Command menu / palette primitives (cmdk).',
  },
  {
    name: 'combobox',
    file: 'combobox.tsx',
    title: 'Combobox',
    description: 'Searchable single-select (Popover + Command).',
  },
  {
    name: 'calendar',
    file: 'calendar.tsx',
    title: 'Calendar',
    description: 'Date picker calendar (react-day-picker).',
  },
  {
    name: 'sidebar',
    file: 'sidebar.tsx',
    title: 'Sidebar',
    description: 'Collapsible app-shell sidebar with mobile sheet.',
  },
  {
    name: 'data-table-column-header',
    file: 'data-table-column-header.tsx',
    title: 'DataTable Column Header',
    description: 'Sortable/hideable column header for a TanStack table.',
  },
  {
    name: 'data-table-view-options',
    file: 'data-table-view-options.tsx',
    title: 'DataTable View Options',
    description: 'Column-visibility menu for a TanStack table.',
  },
];
