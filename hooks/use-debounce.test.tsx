import { expect, test } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './use-debounce.js';

test('keeps the current value until the latest change settles', async () => {
  const hook = renderHook(({ value }) => useDebounce(value, 15), {
    initialProps: { value: 'first' },
  });
  hook.rerender({ value: 'second' });
  expect(hook.result.current).toBe('first');
  hook.rerender({ value: 'third' });
  await act(() => Bun.sleep(25));
  expect(hook.result.current).toBe('third');
});

test('preserves function values without invoking them as state updaters', async () => {
  let calls = 0;
  const original = () => calls++;
  const latest = () => calls++;
  const hook = renderHook(({ value }) => useDebounce(value, 0), {
    initialProps: { value: original },
  });
  expect(hook.result.current).toBe(original);
  hook.rerender({ value: latest });
  await act(() => Bun.sleep(10));
  expect(hook.result.current).toBe(latest);
  expect(calls).toBe(0);
});

test('cancels a pending update when unmounted', async () => {
  const hook = renderHook(() => useDebounce('value', 10));
  hook.unmount();
  await act(() => Bun.sleep(20));
  expect(hook.result.current).toBe('value');
});
