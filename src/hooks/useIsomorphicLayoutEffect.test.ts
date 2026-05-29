import { describe, it, expect, vi } from 'vitest';
import { useLayoutEffect } from 'react';
import { renderHook } from '@testing-library/react';
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
