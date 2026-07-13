import { renderHook } from '@testing-library/react';
import { useLayoutEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

describe('useIsomorphicLayoutEffect', () => {
  it('resolves to useLayoutEffect in a DOM (jsdom) environment', () => {
    // window is defined under jsdom, so the shim should pick the layout effect.
    expect(useIsomorphicLayoutEffect).toBe(useLayoutEffect);
  });

  it('runs the effect callback when used', () => {
    const effect = vi.fn();
    renderHook(() => useIsomorphicLayoutEffect(effect, []));
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
