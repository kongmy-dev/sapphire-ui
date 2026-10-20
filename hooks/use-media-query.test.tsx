import { afterEach, expect, test } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useMediaQuery } from './use-media-query.js';

const original = window.matchMedia;
afterEach(() => {
  window.matchMedia = original;
});

test('tracks query changes and detaches listeners on replacement and unmount', () => {
  const narrow = original.call(window, '(max-width: 600px)');
  const wide = original.call(window, '(min-width: 1000px)');
  window.matchMedia = (query) => (query.includes('max') ? narrow : wide);
  const hook = renderHook(({ query }) => useMediaQuery(query), {
    initialProps: { query: '(max-width: 600px)' },
  });
  expect(hook.result.current).toBe(narrow.matches);
  act(() =>
    narrow.dispatchEvent(new MediaQueryListEvent('change', { matches: true })),
  );
  expect(hook.result.current).toBe(true);
  hook.rerender({ query: '(min-width: 1000px)' });
  expect(hook.result.current).toBe(wide.matches);
  act(() =>
    narrow.dispatchEvent(
      new MediaQueryListEvent('change', { matches: !wide.matches }),
    ),
  );
  expect(hook.result.current).toBe(wide.matches);
  act(() =>
    wide.dispatchEvent(new MediaQueryListEvent('change', { matches: false })),
  );
  expect(hook.result.current).toBe(false);
  hook.unmount();
});
