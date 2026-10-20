import { expect, test } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './hover-card.examples.js';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card.js';

test('focus opens a portaled preview and blur dismisses it without moving focus', async () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger href="#profile">Profile</HoverCardTrigger>
      <HoverCardContent ref={ref} className="custom">
        Preview biography
      </HoverCardContent>
    </HoverCard>,
  );
  const trigger = screen.getByRole('link');
  act(() => trigger.focus());
  await waitFor(() =>
    expect(screen.queryByText('Preview biography')).not.toBeNull(),
  );
  expect(ref.current?.className).toBe('sp-hover-card custom');
  expect(view.container.contains(ref.current)).toBe(false);
  expect(document.activeElement).toBe(trigger);
  act(() => trigger.blur());
  await waitFor(() =>
    expect(screen.queryByText('Preview biography')).toBeNull(),
  );
});

test('controlled previews retain state until the owner closes them and clean up on unmount', () => {
  const view = render(
    <HoverCard open>
      <HoverCardTrigger href="#profile">Profile</HoverCardTrigger>
      <HoverCardContent>Controlled preview</HoverCardContent>
    </HoverCard>,
  );
  expect(screen.getByText('Controlled preview')).not.toBeNull();
  view.unmount();
  expect(screen.queryByText('Controlled preview')).toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} reveals supplementary content on focus`, async () => {
    render(createElement(example.render));
    fireEvent.focus(screen.getByRole('link'));
    await waitFor(() => expect(screen.queryByRole('heading')).not.toBeNull());
  });
}
