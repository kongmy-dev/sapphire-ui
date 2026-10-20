import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef } from 'react';
import { examples } from './scroll-area.examples.js';
import { ScrollArea, ScrollBar } from './scroll-area.js';

test('names the focusable viewport and preserves native root refs and classes', async () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <ScrollArea
      ref={ref}
      className="custom"
      aria-label="Messages"
      type="always"
    >
      <p>Message history</p>
      <ScrollBar orientation="horizontal" className="horizontal" forceMount />
    </ScrollArea>,
  );
  expect(ref.current?.className).toBe('sp-scroll-area custom');
  const viewport = screen.getByRole('region', { name: 'Messages' });
  expect(viewport.tabIndex).toBe(0);
  await userEvent.tab();
  expect(document.activeElement).toBe(viewport);
  expect(
    view.container.querySelector('[data-orientation="horizontal"]')?.className,
  ).toContain('horizontal');
  view.unmount();
  expect(screen.queryByRole('region')).toBeNull();
});

test('provides a default accessible name and supports labelledby', () => {
  const view = render(<ScrollArea>Entries</ScrollArea>);
  expect(
    screen.getByRole('region', { name: 'Scrollable content' }),
  ).not.toBeNull();
  view.rerender(
    <>
      <h2 id="history-label">History</h2>
      <ScrollArea aria-labelledby="history-label">Entries</ScrollArea>
    </>,
  );
  expect(screen.getByRole('region', { name: 'History' })).not.toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} exposes keyboard accessible scroll content`, async () => {
    render(createElement(example.render));
    const region = screen.getByRole('region');
    expect(region.textContent).not.toBe('');
    await userEvent.tab();
    expect(document.activeElement).toBe(region);
  });
}
