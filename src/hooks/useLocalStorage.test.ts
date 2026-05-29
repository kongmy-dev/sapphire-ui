import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('uses the initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('lazily reads a previously persisted value', () => {
    window.localStorage.setItem('k', JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('stored');
  });

  it('writes JSON through to localStorage on update', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 0));
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(window.localStorage.getItem('count')).toBe('5');
  });

  it('supports a functional updater', () => {
    const { result } = renderHook(() => useLocalStorage<number>('count', 1));
    act(() => result.current[1]((prev) => prev + 41));
    expect(result.current[0]).toBe(42);
  });

  it('syncs from a cross-tab storage event', () => {
    const { result } = renderHook(() => useLocalStorage('k', 'a'));
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: 'k', newValue: JSON.stringify('b') }),
      );
    });
    expect(result.current[0]).toBe('b');
  });

  it('falls back to the initial value when stored JSON is corrupt', () => {
    window.localStorage.setItem('k', '{not json');
    const { result } = renderHook(() => useLocalStorage('k', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });
});
