import { afterEach, expect, test } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './code-block.examples.js';
import { CodeBlock } from './code-block.js';

const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  if (descriptor === undefined) Reflect.deleteProperty(navigator, 'clipboard');
  else Object.defineProperty(navigator, 'clipboard', descriptor);
});
const clipboard = (writeText: (value: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });

test('escapes source text and preserves pre attributes refs and language hints', () => {
  const ref = createRef<HTMLPreElement>();
  render(
    <CodeBlock
      ref={ref}
      className="custom"
      title="Source"
      code="<script>unsafe()</script>"
      language="html"
    />,
  );
  const pre = screen.getByTitle('Source');
  expect<HTMLElement | null>(ref.current).toBe(pre);
  expect(pre.className).toBe('sp-code-block-pre custom');
  expect(pre.getAttribute('data-lang')).toBe('html');
  expect(pre.textContent).toBe('<script>unsafe()</script>');
  expect(pre.querySelector('script')).toBeNull();
  expect(screen.queryByRole('button')).toBeNull();
});

test('copies the current source and resets its feedback', async () => {
  const writes: string[] = [];
  clipboard(async (value) => {
    writes.push(value);
  });
  const view = render(<CodeBlock code="first" copyable />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Copy code to clipboard' }),
  );
  await screen.findByRole('button', { name: 'Copied' });
  expect(writes).toEqual(['first']);
  await act(() => Bun.sleep(1520));
  expect(
    screen.getByRole('button', { name: 'Copy code to clipboard' }),
  ).not.toBeNull();
  view.rerender(<CodeBlock code="second" copyable />);
  fireEvent.click(screen.getByRole('button'));
  await screen.findByRole('button', { name: 'Copied' });
  expect(writes).toEqual(['first', 'second']);
  view.unmount();
});

test('does not announce a successful copy when clipboard access fails', async () => {
  clipboard(async () => {
    throw new Error('Denied');
  });
  render(<CodeBlock code="private" copyable variant="light" />);
  await act(async () => fireEvent.click(screen.getByRole('button')));
  await waitFor(() =>
    expect(screen.getByRole('button').textContent).toBe('Copy'),
  );
  expect(screen.queryByRole('button', { name: 'Copied' })).toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} renders its documented source`, () => {
    const view = render(createElement(example.render));
    expect(view.container.querySelector('pre code')?.textContent).not.toBe('');
  });
}
