import { afterEach, expect, test } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { useLocalStorage } from './use-local-storage.js';

const number = (value: unknown) => {
  if (typeof value !== 'number') throw new Error('Expected number');
  return value;
};
const storageEvent = (
  key: string | null,
  newValue: string | null,
  storageArea: Storage | null = null,
) =>
  window.dispatchEvent(
    new StorageEvent('storage', { key, newValue, storageArea }),
  );

afterEach(() => localStorage.clear());

function StoredCount() {
  const [value] = useLocalStorage('count', 2, number);
  return createElement('output', null, value);
}

function HydrationExample({ renders }: { renders: number[] }) {
  const [value] = useLocalStorage('hydration', 1, number);
  renders.push(value);
  return createElement('output', null, value);
}

test('reads validated data after the initial fallback render and preserves direct and functional updates', () => {
  localStorage.setItem('count', '8');
  const renders: number[] = [];
  const hook = renderHook(() => {
    const result = useLocalStorage('count', 2, number);
    renders.push(result[0]);
    return result;
  });
  expect(renders[0]).toBe(2);
  expect(hook.result.current[0]).toBe(8);
  act(() => {
    hook.result.current[1](10);
    hook.result.current[1]((previous) => previous + 1);
  });
  expect(hook.result.current[0]).toBe(11);
  expect(localStorage.getItem('count')).toBe('11');
});

test('uses fallbacks for missing malformed and rejected JSON', () => {
  for (const raw of [null, '{broken', '"wrong"']) {
    if (raw === null) localStorage.removeItem('count');
    else localStorage.setItem('count', raw);
    const hook = renderHook(() => useLocalStorage('count', 4, number));
    expect(hook.result.current[0]).toBe(4);
    hook.unmount();
  }
});

test('changes keys without writing the previous key value into the new key', () => {
  localStorage.setItem('first', '5');
  localStorage.setItem('second', '20');
  const hook = renderHook(({ key }) => useLocalStorage(key, 1, number), {
    initialProps: { key: 'first' },
  });
  hook.rerender({ key: 'second' });
  expect(hook.result.current[0]).toBe(20);
  act(() => hook.result.current[1]((previous) => previous + 1));
  expect(localStorage.getItem('first')).toBe('5');
  expect(localStorage.getItem('second')).toBe('21');
});

test('receives cross tab updates removals clear and invalid values while ignoring other storage', () => {
  const hook = renderHook(() => useLocalStorage('count', 3, number));
  act(() => storageEvent('count', '7', localStorage));
  expect(hook.result.current[0]).toBe(7);
  act(() => storageEvent('other', '9'));
  act(() => storageEvent('count', '9', sessionStorage));
  expect(hook.result.current[0]).toBe(7);
  act(() => storageEvent('count', null));
  expect(hook.result.current[0]).toBe(3);
  act(() => storageEvent('count', '12'));
  act(() => storageEvent(null, null));
  expect(hook.result.current[0]).toBe(3);
  act(() => storageEvent('count', '"rejected"'));
  expect(hook.result.current[0]).toBe(3);
});

test('preserves undefined parser results and function values using React setter convention', () => {
  localStorage.setItem('optional', 'null');
  const optional = renderHook(() =>
    useLocalStorage<string | undefined>(
      'optional',
      'fallback',
      () => undefined,
    ),
  );
  expect(optional.result.current[0]).toBeUndefined();
  act(() => optional.result.current[1](undefined));
  expect(localStorage.getItem('optional')).toBeNull();
  const first = () => 'first';
  const second = () => 'second';
  const functions = renderHook(() =>
    useLocalStorage('function', first, () => second),
  );
  expect(functions.result.current[0]).toBe(first);
  act(() => functions.result.current[1](() => second));
  expect(functions.result.current[0]).toBe(second);
});

test('SSR renders the fallback even when browser storage contains a different value', () => {
  localStorage.setItem('count', '50');
  expect(renderToString(createElement(StoredCount))).toContain('>2<');
});

test('keeps in memory updates when private storage or serialization rejects writes', () => {
  const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get() {
      throw new Error('Denied');
    },
  });
  try {
    const hook = renderHook(() => useLocalStorage('count', 2, number));
    expect(hook.result.current[0]).toBe(2);
    act(() => hook.result.current[1](9));
    expect(hook.result.current[0]).toBe(9);
    act(() => storageEvent('count', '6', sessionStorage));
    expect(hook.result.current[0]).toBe(9);
  } finally {
    if (descriptor !== undefined)
      Object.defineProperty(window, 'localStorage', descriptor);
  }
  const big = renderHook(() => useLocalStorage('large', 1n, () => 0n));
  act(() => big.result.current[1](2n));
  expect(big.result.current[0]).toBe(2n);
});

test('hydrates with the server fallback before synchronizing persisted data', async () => {
  localStorage.setItem('hydration', '99');
  const renders: number[] = [];
  const errors: unknown[] = [];
  const container = document.createElement('div');
  container.innerHTML = renderToString(
    createElement(HydrationExample, { renders }),
  );
  document.body.append(container);
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(
        container,
        createElement(HydrationExample, { renders }),
        {
          onRecoverableError: (error) => errors.push(error),
        },
      );
    });
    expect(renders.slice(0, 2)).toEqual([1, 1]);
    expect(container.textContent).toBe('99');
    expect(errors).toEqual([]);
  } finally {
    act(() => root?.unmount());
    container.remove();
  }
});
