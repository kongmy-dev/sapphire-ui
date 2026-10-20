import { expect, test } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useOnClickOutside } from './use-on-click-outside.js';

function Example({
  handler,
  absent = false,
}: {
  handler: (() => void) | false | null;
  absent?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, handler);
  return (
    <>
      <div ref={absent ? undefined : ref}>
        <button type="button">Inside</button>
      </div>
      <button type="button">Outside</button>
    </>
  );
}

test('reports outside mouse, touch and focus events but ignores descendants', () => {
  let calls = 0;
  const hook = render(<Example handler={() => calls++} />);
  const inside = screen.getByRole('button', { name: 'Inside' });
  const outside = screen.getByRole('button', { name: 'Outside' });
  fireEvent.mouseDown(inside);
  fireEvent.touchStart(inside);
  fireEvent.focusIn(inside);
  expect(calls).toBe(0);
  fireEvent.mouseDown(outside);
  fireEvent.touchStart(outside);
  fireEvent.focusIn(outside);
  expect(calls).toBe(3);
  hook.rerender(<Example handler={false} />);
  fireEvent.mouseDown(outside);
  expect(calls).toBe(3);
});

test('ignores absent targets and removes listeners when unmounted', () => {
  let calls = 0;
  const hook = render(<Example absent handler={() => calls++} />);
  fireEvent.mouseDown(document.body);
  expect(calls).toBe(0);
  hook.rerender(<Example handler={() => calls++} />);
  fireEvent.mouseDown(document.body);
  expect(calls).toBe(1);
  hook.unmount();
  fireEvent.mouseDown(document.body);
  expect(calls).toBe(1);
});
