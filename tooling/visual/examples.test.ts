import { describe, expect, it } from 'bun:test';
import { exampleNames, ROUTES, slugOf } from './examples';

describe('example slugs', () => {
  it('slugs the headings of the v3 docs sections', () => {
    const slugs = [
      'As Link (asChild)',
      'Select (Radix)',
      'Theming & Customization',
      'Editorial & Complex Primitives',
      'SEO / Head',
      'Custom Elements (Astro / vanilla HTML)',
      'useIsomorphicLayoutEffect',
    ].map(slugOf);
    expect(slugs).toEqual([
      'as-link-aschild',
      'select-radix',
      'theming-customization',
      'editorial-complex-primitives',
      'seo-head',
      'custom-elements-astro-vanilla-html',
      'useisomorphiclayouteffect',
    ]);
  });

  it('trims separators from both ends', () => {
    expect(slugOf('  --Props!  ')).toBe('props');
  });
});

describe('example manifest', () => {
  it('names each pinned section or React example once', () => {
    const names = exampleNames();
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('buttons/variants');
    expect(
      names.every((name) =>
        /^(?:[a-z]+\/[a-z0-9-]+|react\/[a-z0-9-]+\/[a-z0-9-]+(?:\/open)?)$/.test(
          name,
        ),
      ),
    ).toBe(true);
  });

  it('lists a section as pinned or skipped, never both', () => {
    const both = ROUTES.flatMap((route) =>
      route.pinned.filter((slug) => slug in route.skipped),
    );
    expect(both).toEqual([]);
  });

  it('gives every skipped section a reason', () => {
    const reasons = ROUTES.flatMap((route) => Object.values(route.skipped));
    expect(reasons.every((reason) => reason.length > 0)).toBe(true);
  });

  it('serves every route once', () => {
    const paths = ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
