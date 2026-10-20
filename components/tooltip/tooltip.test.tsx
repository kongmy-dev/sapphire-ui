import { expect, test } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './tooltip.examples.js';
import {
  TooltipContent,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from './tooltip.js';

test('exposes a description on keyboard focus and dismisses with Escape', async () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <TooltipProvider delayDuration={0}>
      <TooltipRoot>
        <TooltipTrigger>Inspect</TooltipTrigger>
        <TooltipContent ref={ref} className="custom">
          Inspection details
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>,
  );
  const trigger = screen.getByRole('button');
  act(() => trigger.focus());
  const tooltip = await screen.findByRole('tooltip');
  expect(trigger.getAttribute('aria-describedby')).toBe(tooltip.id);
  expect(ref.current?.className).toBe('sp-tooltip custom');
  expect(view.container.contains(tooltip)).toBe(false);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

for (const example of examples) {
  test(`example ${example.name} describes each focused action`, async () => {
    render(createElement(example.render));
    for (const button of screen.getAllByRole('button')) {
      act(() => button.focus());
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip.textContent).not.toBe('');
      act(() => button.blur());
      await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    }
  });
}
