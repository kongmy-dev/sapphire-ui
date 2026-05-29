import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

/** Minimal MediaQueryList stub whose `change` event we can drive by hand. */
function installMatchMedia(initial: boolean) {
  let matches = initial;
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    get matches() {
      return matches;
    },
    media: '',
    onchange: null,
    addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    emit(next: boolean) {
      matches = next;
      listeners.forEach((l) => l({ matches: next } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}

describe('useMediaQuery', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reflects the initial match state', () => {
    installMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('updates when the query result changes', () => {
    const mq = installMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    act(() => mq.emit(true));
    expect(result.current).toBe(true);
  });

  it('detaches its listener on unmount', () => {
    const mq = installMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(mq.listenerCount()).toBe(1);
    unmount();
    expect(mq.listenerCount()).toBe(0);
  });
});
