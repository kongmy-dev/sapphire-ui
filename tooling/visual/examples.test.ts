import { describe, expect, it } from 'bun:test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ARCHIVED_DOCUMENTATION_PINS, exampleNames } from './examples.js';
import sectionPins from './section-pins.json' with { type: 'json' };
import { coveredPins } from './specimens.js';

const ROOT = join(import.meta.dir, '../..');

describe('example manifest', () => {
  it('names each active section or rendered example once', () => {
    const names = exampleNames();
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('buttons/variants');
    expect(names).toContain('parity-states');
    expect(
      names
        .filter((name) => name !== 'parity-states')
        .every((name) =>
          /^(?:[a-z]+\/[a-z0-9-]+|(?:react|native)\/[a-z0-9-]+\/[a-z0-9-]+(?:\/open)?)$/.test(
            name,
          ),
        ),
    ).toBe(true);
  });

  it('has a v4 specimen for every active section pin and no unknown section', () => {
    expect(coveredPins(ROOT).toSorted()).toEqual(sectionPins.toSorted());
  });

  it('preserves explicitly retired documentation PNGs without scheduling them', () => {
    const names = exampleNames();
    for (const [name, reason] of Object.entries(ARCHIVED_DOCUMENTATION_PINS)) {
      expect(reason.length).toBeGreaterThan(0);
      expect(names).not.toContain(name);
      for (const scheme of ['light', 'dark']) {
        expect(
          existsSync(join(ROOT, `tests/visual/pins/${name}.${scheme}.png`)),
        ).toBe(true);
      }
    }
  });
});
