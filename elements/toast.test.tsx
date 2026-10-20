import { afterEach, expect, mock, test } from 'bun:test';
import { act, render, within } from '@testing-library/react';
import { createRef } from 'react';
import { Toast, type ToastRef } from '../components/toast/toast.js';
import { examples } from './toast.examples.js';
import { ToastElement } from './toast.js';

const originalBridge = Object.getOwnPropertyDescriptor(
  window,
  '__sapphireToast',
);
afterEach(() => {
  for (const element of document.querySelectorAll(
    'sapphire-toast, [data-toast-example]',
  ))
    element.remove();
  if (originalBridge)
    Object.defineProperty(window, '__sapphireToast', originalBridge);
  else Reflect.deleteProperty(window, '__sapphireToast');
});
function toast() {
  if (!ToastElement) throw new Error('Missing browser constructor');
  return new ToastElement();
}
function notify(message: string) {
  const bridge: unknown = Reflect.get(window, '__sapphireToast');
  if (typeof bridge !== 'function')
    throw new Error('Missing global toast bridge');
  bridge(message);
}
function contract(root: ParentNode) {
  return Array.from(root.querySelectorAll('[class]')).map((node) => ({
    class: node.getAttribute('class'),
    data: Array.from(node.attributes)
      .filter((attribute) => attribute.name.startsWith('data-'))
      .map((attribute) => [attribute.name, attribute.value]),
  }));
}

test('registers, escapes messages and matches React classes and data for every status', () => {
  const element = toast();
  document.body.append(element);
  expect(customElements.get('sapphire-toast')).toBe(ToastElement);
  const ref = createRef<ToastRef>();
  const view = render(<Toast ref={ref} />);
  for (const variant of ['success', 'info', 'warning', 'error'] as const) {
    element.show('<img src=x>', variant);
    act(() => ref.current?.show('<img src=x>', variant));
  }
  const native = within(element).getByRole('status');
  const react = document.body.querySelector(
    '.sp-toast-viewport:not(sapphire-toast > *)',
  );
  if (!react?.parentElement) throw new Error('Missing React viewport');
  expect(contract(native)).toEqual(contract(react));
  expect(native.querySelector('img')).toBeNull();
  expect(native.getAttribute('aria-live')).toBe('polite');
  expect(native.getAttribute('aria-relevant')).toBe('additions text');
  expect(native.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(4);
  view.unmount();
});

test('opens then expires individual messages while keeping long notifications', async () => {
  const element = toast();
  element.setAttribute('duration', '50');
  document.body.append(element);
  element.show('Short');
  element.show('Long', 'info', 1000);
  await Bun.sleep(25);
  expect(within(element).getByText('Short').parentElement?.dataset.state).toBe(
    'open',
  );
  await Bun.sleep(50);
  expect(
    within(element).getByText('Short').parentElement?.dataset.state,
  ).toBeUndefined();
  await Bun.sleep(410);
  expect(within(element).queryByText('Short')).toBeNull();
  expect(within(element).getByText('Long')).not.toBeNull();
});

test('normalizes duration input and prevents zero-duration reopening', async () => {
  const element = toast();
  element.show('Detached');
  document.body.append(element);
  element.setAttribute('duration', 'invalid');
  element.show('Fallback', 'info', Number.NaN);
  element.show('Immediate', 'success', -1);
  await Bun.sleep(30);
  expect(within(element).queryByText('Detached')).toBeNull();
  expect(
    within(element).getByText('Immediate').parentElement?.dataset.state,
  ).toBeUndefined();
  expect(
    within(element).getByText('Fallback').parentElement?.dataset.state,
  ).toBe('open');
});

test('restores mounted global owners and preexisting bridges without clobbering replacements', () => {
  const previous = mock(() => {});
  Reflect.set(window, '__sapphireToast', previous);
  const first = toast();
  const second = toast();
  document.body.append(first, second);
  notify('Second owner');
  expect(within(second).getByText('Second owner')).not.toBeNull();
  second.remove();
  notify('First owner');
  expect(within(first).getByText('First owner')).not.toBeNull();
  first.remove();
  expect(Reflect.get(window, '__sapphireToast')).toBe(previous);
  document.body.append(first, second);
  first.remove();
  notify('Still second');
  expect(within(second).getByText('Still second')).not.toBeNull();
  Reflect.set(window, '__sapphireToast', previous);
  second.remove();
  expect(Reflect.get(window, '__sapphireToast')).toBe(previous);
});

test('disconnect clears pending frames and timers, stale handles and reconnect duplicates', async () => {
  Reflect.deleteProperty(window, '__sapphireToast');
  const element = toast();
  document.body.append(element);
  const handle: unknown = Reflect.get(window, '__sapphireToast');
  element.show('Before detach', 'success', 5);
  element.remove();
  if (typeof handle === 'function') handle('Stale');
  expect(Reflect.has(window, '__sapphireToast')).toBe(false);
  await Bun.sleep(420);
  expect(element.childElementCount).toBe(0);
  document.body.append(element);
  element.show('Reconnected');
  expect(element.querySelectorAll('[role="status"]')).toHaveLength(1);
  expect(within(element).getByText('Reconnected')).not.toBeNull();
});

for (const example of examples)
  test(`native toast example ${example.name}`, () => {
    const root = example.render();
    root.setAttribute('data-toast-example', '');
    document.body.append(root);
    for (const button of within(root).getAllByRole('button')) button.click();
    expect(
      within(root).getByRole('status').querySelectorAll('.sp-toast'),
    ).toHaveLength(4);
  });
