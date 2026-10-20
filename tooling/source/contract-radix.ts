import ts from 'typescript';

const STATES: Record<string, readonly string[]> = {
  Dialog: ['open', 'closed'],
  AlertDialog: ['open', 'closed'],
  Popover: ['open', 'closed'],
  Collapsible: ['open', 'closed'],
  Accordion: ['open', 'closed'],
  DropdownMenu: ['open', 'closed', 'checked', 'unchecked', 'indeterminate'],
  ContextMenu: ['open', 'closed', 'checked', 'unchecked', 'indeterminate'],
  Menubar: ['open', 'closed', 'checked', 'unchecked', 'indeterminate'],
  Checkbox: ['checked', 'unchecked', 'indeterminate'],
  RadioGroup: ['checked', 'unchecked'],
  Switch: ['checked', 'unchecked'],
  Toggle: ['on', 'off'],
  ToggleGroup: ['on', 'off'],
  Tabs: ['active', 'inactive'],
  Tooltip: ['closed', 'delayed-open', 'instant-open'],
  Toast: ['open', 'closed'],
  Select: ['open', 'closed', 'checked', 'unchecked'],
  NavigationMenu: ['open', 'closed'],
};

export function radixImports(source: ts.SourceFile): string[] {
  return source.statements.filter(ts.isImportDeclaration).flatMap((node) => {
    if (
      !ts.isStringLiteral(node.moduleSpecifier) ||
      node.moduleSpecifier.text !== 'radix-ui'
    )
      return [];
    const bindings = node.importClause?.namedBindings;
    if (bindings === undefined || !ts.isNamedImports(bindings)) return [];
    return bindings.elements.map(
      (element) => (element.propertyName ?? element.name).text,
    );
  });
}

const FLOATING = [
  'Popover',
  'Tooltip',
  'DropdownMenu',
  'ContextMenu',
  'Menubar',
  'Select',
  'HoverCard',
];
const ATTRIBUTES: Record<
  string,
  { primitives: readonly string[]; values: readonly string[] }
> = {
  'data-side': {
    primitives: FLOATING,
    values: ['top', 'bottom', 'left', 'right'],
  },
  'data-align': { primitives: FLOATING, values: ['start', 'center', 'end'] },
  'data-orientation': {
    primitives: [
      'Accordion',
      'Tabs',
      'ScrollArea',
      'Slider',
      'ToggleGroup',
      'Toolbar',
      'RadioGroup',
    ],
    values: ['horizontal', 'vertical'],
  },
};

export function radixValues(
  primitives: readonly string[],
  attribute: string,
): readonly string[] {
  if (attribute === 'data-state')
    return primitives.flatMap((name) => STATES[name] ?? []);
  const domain = ATTRIBUTES[attribute];
  if (domain === undefined) return [];
  return primitives.some((primitive) => domain.primitives.includes(primitive))
    ? domain.values
    : [];
}
