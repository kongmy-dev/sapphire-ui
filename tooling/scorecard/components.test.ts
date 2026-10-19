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

const NO_SPECIMENS = new Map<string, string>();

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

  it('names a v3 file after the v4 folder its subpath moved to', () => {
    expect(
      componentNames([
        'src/components/ui/ToggleSwitch.tsx',
        'components/switch/switch.css',
      ]),
    ).toEqual(['switch']);
  });

  it('finds nothing in a tree without components', () => {
    expect(componentNames(['README.md', 'tooling/gates/size.ts'])).toEqual([]);
  });
});

describe('scorecard component table', () => {
  it('reads no for every v4 cell of a v3-only component', () => {
    const [row] = componentTable(v3Tree, null, NO_SPECIMENS);
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
    const rows = componentTable(v4Button, null, NO_SPECIMENS);
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

  it('reads a pin from a data-pin section in the component specimen', () => {
    const specimen = 'components/button/button.examples.html';
    const specimens = new Map([
      [specimen, '<section data-pin="buttons/variants"></section>'],
    ]);
    const paths = [...v4Button, specimen];
    expect(componentTable(paths, null, specimens)[0]?.pin).toBe(true);
  });

  it('reads no pin from a specimen without one or another folder', () => {
    const specimens = new Map([
      ['components/button/button.examples.html', '<section></section>'],
      [
        'components/card/card.examples.html',
        '<section data-pin="cards/default-card"></section>',
      ],
    ]);
    const paths = [...v4Button, `${PIN_DIR}/buttons/variants.light.png`];
    expect(componentTable(paths, null, specimens)[0]?.pin).toBe(false);
  });

  it('reads a registry item from the names in the registry source', () => {
    const registry = JSON.stringify({
      items: [{ name: 'button' }, { name: 3 }],
    });
    expect(componentTable(v4Button, registry, NO_SPECIMENS)[0]?.registry).toBe(
      true,
    );
  });

  it('reads no from a registry source that is not valid', () => {
    expect(
      componentTable(v4Button, 'not json', NO_SPECIMENS)[0]?.registry,
    ).toBe(false);
    expect(
      componentTable(v4Button, '{"items":{}}', NO_SPECIMENS)[0]?.registry,
    ).toBe(false);
    expect(componentTable(v4Button, '[]', NO_SPECIMENS)[0]?.registry).toBe(
      false,
    );
  });
});

describe('scorecard reference pins', () => {
  const paths = [
    `${PIN_DIR}/buttons/variants.light.png`,
    `${PIN_DIR}/buttons/variants.dark.png`,
    `${PIN_DIR}/buttons/sizes.light.png`,
    `${PIN_DIR}/buttons/sizes.dark.png`,
    `${PIN_DIR}/buttons/notes.txt`,
  ];

  it('counts every pin file when no specimen renders one', () => {
    expect(referencePinCount(paths, NO_SPECIMENS)).toBe(4);
  });

  it('leaves out the pins a specimen renders', () => {
    const specimens = new Map([
      [
        'components/button/button.examples.html',
        '<section data-pin="buttons/variants"></section>',
      ],
    ]);
    expect(referencePinCount(paths, specimens)).toBe(2);
  });
});
