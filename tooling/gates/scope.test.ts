import { describe, expect, it } from 'bun:test';
import { isInScope } from './scope';

describe('gate scope', () => {
  it('leaves only archived registry data out', () => {
    expect(isInScope('registry/legacy-r/button.json')).toBe(false);
  });

  it('keeps tooling, scripts, config and the registry manifest', () => {
    const live = [
      'tooling/gates/comments.ts',
      'tooling/registry/build.ts',
      'playwright.config.ts',
      'tooling/registry/source.ts',
      'src/unexpected.ts',
      'tests/examples.a11y.spec.ts',
    ];
    expect(live.filter(isInScope)).toEqual(live);
  });
});
