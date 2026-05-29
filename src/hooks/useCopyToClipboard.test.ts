import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

function setClipboard(writeText: ((text: string) => Promise<void>) | undefined) {
  Object.defineProperty(navigator, 'clipboard', {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

describe('useCopyToClipboard', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('copies text and flips isCopied true, then resets after resetMs', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    const { result } = renderHook(() => useCopyToClipboard({ resetMs: 2000 }));

    await act(async () => {
      const ok = await result.current.copy('hello');
      expect(ok).toBe(true);
    });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(result.current.isCopied).toBe(true);
    expect(result.current.copied).toBe('hello');

    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.isCopied).toBe(false);
    expect(result.current.copied).toBeNull();
  });

  it('returns false when the Clipboard API is unavailable', async () => {
    setClipboard(undefined);
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      const ok = await result.current.copy('x');
      expect(ok).toBe(false);
    });
    expect(result.current.isCopied).toBe(false);
  });

  it('returns false when writeText rejects', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const { result } = renderHook(() => useCopyToClipboard());
    await act(async () => {
      const ok = await result.current.copy('x');
      expect(ok).toBe(false);
    });
    expect(result.current.isCopied).toBe(false);
  });
});
