import { expect, test } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef } from 'react';
import { examples } from './popover.examples.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';

test('portals named content with native props refs and Escape focus restoration', async () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <Popover>
      <PopoverTrigger>Open panel</PopoverTrigger>
      <PopoverContent ref={ref} className="custom" aria-label="Panel">
        <button type="button">First action</button>
      </PopoverContent>
    </Popover>,
  );
  const trigger = screen.getByRole('button', { name: 'Open panel' });
  await userEvent.click(trigger);
  const panel = screen.getByRole('dialog', { name: 'Panel' });
  expect<HTMLElement | null>(ref.current).toBe(panel);
  expect(panel.className).toBe('sp-popover custom');
  expect(view.container.contains(panel)).toBe(false);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'First action' }),
    ),
  );
  fireEvent.keyDown(panel, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

for (const example of examples) {
  test(`example ${example.name} opens and closes its panel`, async () => {
    render(createElement(example.render));
    await userEvent.click(screen.getByRole('button'));
    const panel = screen.getByRole('dialog');
    expect(panel.textContent).not.toBe('');
    if (example.name === 'settings')
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Sam' },
      });
    await userEvent.click(
      screen.getByRole('button', {
        name: example.name === 'settings' ? 'Save settings' : 'Dismiss details',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
}
