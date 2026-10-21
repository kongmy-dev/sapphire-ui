import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.js';

function BrowserExample({ events }: { events: string[] }) {
  useIsomorphicLayoutEffect(() => {
    events.push('mounted');
    return () => {
      events.push('released');
    };
  }, [events]);
  return createElement('span', null, 'content');
}

function ServerExample({ onEffect }: { onEffect: () => void }) {
  useIsomorphicLayoutEffect(onEffect);
  return createElement('span', null, 'server');
}

test('runs browser layout effects and releases them on unmount', () => {
  const events: string[] = [];
  const view = render(createElement(BrowserExample, { events }));
  expect(events).toEqual(['mounted']);
  view.unmount();
  expect(events).toEqual(['mounted', 'released']);
});

test('can render on the server without running the effect', () => {
  let calls = 0;
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: undefined,
  });
  try {
    expect(
      renderToString(createElement(ServerExample, { onEffect: () => calls++ })),
    ).toContain('server');
    expect(calls).toBe(0);
  } finally {
    if (descriptor !== undefined)
      Object.defineProperty(globalThis, 'window', descriptor);
  }
});
