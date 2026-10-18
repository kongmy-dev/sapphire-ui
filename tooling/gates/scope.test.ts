import { describe, expect, it } from 'bun:test';
import { isInScope } from './scope';

describe('gate scope', () => {
  it('leaves the frozen lane out', () => {
    const frozen = [
      'src/index.css',
      'src/components/ui/Button.tsx',
      'registry/blocks/sidebar.tsx',
      'tests/registry-consumer/app/main.tsx',
      'design/colors_and_type.css',
    ];
    expect(frozen.filter(isInScope)).toEqual([]);
  });

  it('keeps tooling, scripts, config and the registry manifest', () => {
    const live = [
      'tooling/gates/comments.ts',
      'scripts/build-registry.ts',
      'vite.config.ts',
      'registry/items.ts',
      'tests/registry-consumer/vite.config.ts',
      'tests/a11y.spec.ts',
    ];
    expect(live.filter(isInScope)).toEqual(live);
  });
});
