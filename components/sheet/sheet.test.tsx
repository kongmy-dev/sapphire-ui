import { expect, test } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef } from 'react';
import { examples } from './sheet.examples.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from './sheet.js';

test('opens a named modal with native refs side classes and localized close control', async () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <Sheet>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent
        ref={ref}
        side="left"
        className="custom"
        closeLabel="Dismiss"
      >
        <SheetTitle>Profile</SheetTitle>
        <SheetDescription>Update profile details</SheetDescription>
        <button type="button">First action</button>
      </SheetContent>
    </Sheet>,
  );
  const trigger = screen.getByRole('button', { name: 'Open sheet' });
  await userEvent.click(trigger);
  const panel = screen.getByRole('dialog', { name: 'Profile' });
  expect<HTMLElement | null>(ref.current).toBe(panel);
  expect(panel.getAttribute('data-side')).toBe('left');
  expect(panel.className).toBe('sp-sheet custom');
  expect(view.container.contains(panel)).toBe(false);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'First action' }),
    ),
  );
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'Dismiss' }),
  );
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'First action' }),
  );
  await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

test('allows a null base side and controlled state with standalone portaled overlay', () => {
  const view = render(
    <Sheet open>
      <SheetPortal>
        <SheetOverlay className="custom-overlay" />
      </SheetPortal>
      <SheetContent side={null} hideClose>
        <SheetTitle>Controlled</SheetTitle>
        <SheetDescription>Details</SheetDescription>
      </SheetContent>
    </Sheet>,
  );
  expect(screen.getByRole('dialog').hasAttribute('data-side')).toBe(false);
  expect(screen.queryByRole('button')).toBeNull();
  view.unmount();
  expect(screen.queryByRole('dialog')).toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} closes from its action and Escape`, async () => {
    render(createElement(example.render));
    const trigger = screen.getByRole('button');
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog')).not.toBeNull();
    await userEvent.click(
      screen.getByRole('button', {
        name: example.name === 'settings' ? 'Save workspace' : 'Done',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
}
