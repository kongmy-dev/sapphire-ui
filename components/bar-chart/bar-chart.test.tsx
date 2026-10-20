import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './bar-chart.examples.js';
import { BarChart } from './bar-chart.js';

it('makes values available in keyboard order without submitting a surrounding form', async () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <form>
      <BarChart
        ref={ref}
        className="custom"
        data={[15, 75]}
        labels={['January', 'February']}
        tooltipSuffix="%"
        height={240}
      />
    </form>,
  );
  expect(ref.current?.className).toBe('sp-bar-chart custom');
  expect(ref.current?.style.height).toBe('240px');
  const first = screen.getByRole('button', { name: 'January: 15%' });
  await userEvent.tab();
  expect(document.activeElement).toBe(first);
  expect(first.getAttribute('type')).toBe('button');
  await userEvent.keyboard('{Enter}');
  expect(document.activeElement).toBe(first);
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole('button', { name: 'February: 75%' }),
  );
});

it('bounds visual shares and represents invalid amounts as zero', () => {
  const { container } = render(
    <BarChart
      data={[-5, 150, Infinity, Number.NaN]}
      style={{ height: '10rem' }}
    />,
  );
  expect(
    screen
      .getByRole('button', { name: 'Bar 1: -5' })
      .querySelector('.sp-bar-chart-bar')
      ?.getAttribute('style'),
  ).toContain('height: 0%');
  expect(
    screen
      .getByRole('button', { name: 'Bar 2: 150' })
      .querySelector('.sp-bar-chart-bar')
      ?.getAttribute('style'),
  ).toContain('height: 100%');
  expect(screen.getByRole('button', { name: 'Bar 3: 0' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Bar 4: 0' })).not.toBeNull();
  expect(
    container.querySelector('.sp-bar-chart')?.getAttribute('style'),
  ).toContain('height: 10rem');
});

it('renders an empty series without phantom values', () => {
  render(<BarChart data={[]} />);
  expect(screen.queryByRole('button')).toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`exposes every ${name} value`, async () => {
    render(<Example />);
    const bars = screen.getAllByRole('button');
    expect(bars).toHaveLength(4);
    await userEvent.tab();
    expect(document.activeElement).toBe(bars[0]);
  });
}
