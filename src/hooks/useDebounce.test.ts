import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the initial value synchronously', () => {
    const { result } = renderHook(() => useDebounce('a', 300));
    expect(result.current).toBe('a');
  });

  it('only settles on the latest value after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    expect(result.current).toBe('a'); // not yet

    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('a'); // still pending

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('b'); // settled
  });

  it('resets the timer on rapid changes (only the last value lands)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), {
      initialProps: { v: 'a' },
    });

    rerender({ v: 'b' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ v: 'c' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a'); // first timer was cleared

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('c');
  });
});
