import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.js';

test('runs browser layout effects and releases them on unmount', () => {
  const events: string[] = [];
  function Example() {
    useIsomorphicLayoutEffect(() => {
      events.push('mounted');
      return () => {
        events.push('released');
      };
    }, []);
    return createElement('span', null, 'content');
  }
  const view = render(createElement(Example));
  expect(events).toEqual(['mounted']);
  view.unmount();
  expect(events).toEqual(['mounted', 'released']);
});

test('can render on the server without running the effect', () => {
  let calls = 0;
  function Example() {
    useIsomorphicLayoutEffect(() => {
      calls++;
    });
    return createElement('span', null, 'server');
  }
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: undefined,
  });
  try {
    expect(renderToString(createElement(Example))).toContain('server');
    expect(calls).toBe(0);
  } finally {
    if (descriptor !== undefined)
      Object.defineProperty(globalThis, 'window', descriptor);
  }
});
