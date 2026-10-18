import { describe, expect, it } from 'bun:test';
import {
  componentNames,
  componentTable,
  PIN_DIR,
  referencePinCount,
} from './components';

const v3Tree = [
  'src/components/ui/Button.tsx',
  'src/components/ui/AdminLayout.tsx',
  'src/components/ui/SEOHead.tsx',
  'src/components/ui/Button.test.tsx',
  'src/components/ui/index.ts',
  'src/components/ui/types.d.ts',
  'src/components/__tests__/Toast.tsx',
  'src/components/Analytics.tsx',
  'src/components/AnalyticsElement.ts',
  'src/pages/ButtonsPage.tsx',
  'src/lib/theme.ts',
];

const v4Button = [
  'components/button/button.css',
  'components/button/button.tsx',
  'components/button/button.examples.tsx',
  'components/button/button.test.tsx',
  'elements/button.ts',
];

describe('scorecard component names', () => {
  it('kebab-cases v3 files and folds an element into its component', () => {
    expect(componentNames(v3Tree)).toEqual([
      'admin-layout',
      'analytics',
      'button',
      'seo-head',
    ]);
  });

  it('takes the folders under components/ and unions them with v3', () => {
    const names = componentNames([
      ...v3Tree,
      ...v4Button,
      'components/card/card.css',
    ]);
    expect(names).toEqual([
      'admin-layout',
      'analytics',
      'button',
      'card',
      'seo-head',
    ]);
  });

  it('finds nothing in a tree without components', () => {
    expect(componentNames(['README.md', 'tooling/gates/size.ts'])).toEqual([]);
  });
});

describe('scorecard component table', () => {
  it('reads no for every v4 cell of a v3-only component', () => {
    const [row] = componentTable(v3Tree, null);
    expect(row).toEqual({
      name: 'admin-layout',
      css: false,
      react: false,
      examples: false,
      pin: false,
      element: false,
      registry: false,
    });
  });

  it('reads yes for each file a v4 component has', () => {
    const rows = componentTable(v4Button, null);
    expect(rows).toEqual([
      {
        name: 'button',
        css: true,
        react: true,
        examples: true,
        pin: false,
        element: true,
        registry: false,
      },
    ]);
  });

  it('reads a pin from the folder named for the component', () => {
    const paths = [...v4Button, `${PIN_DIR}/button/primary.light.png`];
    expect(componentTable(paths, null)[0]?.pin).toBe(true);
  });

  it('reads a registry item from the names in the registry source', () => {
    const registry = JSON.stringify({
      items: [{ name: 'button' }, { name: 3 }],
    });
    expect(componentTable(v4Button, registry)[0]?.registry).toBe(true);
  });

  it('reads no from a registry source that is not valid', () => {
    expect(componentTable(v4Button, 'not json')[0]?.registry).toBe(false);
    expect(componentTable(v4Button, '{"items":{}}')[0]?.registry).toBe(false);
    expect(componentTable(v4Button, '[]')[0]?.registry).toBe(false);
  });
});

describe('scorecard reference pins', () => {
  it('counts pins that belong to no component row', () => {
    const paths = [
      ...v4Button,
      `${PIN_DIR}/buttons/variants.light.png`,
      `${PIN_DIR}/buttons/variants.dark.png`,
      `${PIN_DIR}/button/primary.light.png`,
      `${PIN_DIR}/buttons/notes.txt`,
    ];
    expect(referencePinCount(paths, componentTable(paths, null))).toBe(2);
  });
});
