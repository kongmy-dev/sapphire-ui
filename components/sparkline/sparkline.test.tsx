import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './sparkline.examples.js';
import { Sparkline, type SparklineProps } from './sparkline.js';

it('provides status text as well as color and preserves native props and refs', () => {
  const ref = createRef<HTMLDivElement>();
  const props = {
    data: [
      { status: 'warning', tooltip: 'Slow response' },
      { status: 'error' },
    ],
    height: 24,
  } satisfies SparklineProps;
  render(<Sparkline {...props} ref={ref} className="custom" />);
  expect(ref.current?.className).toBe('sp-sparkline custom');
  expect(ref.current?.style.height).toBe('24px');
  expect(
    screen.getByRole('img', { name: 'warning: Slow response' }).title,
  ).toBe('Slow response');
  expect(
    screen.getByRole('img', { name: 'error' }).getAttribute('data-status'),
  ).toBe('error');
});

it('respects style height when no explicit height is supplied and permits empty data', () => {
  const ref = createRef<HTMLDivElement>();
  render(<Sparkline data={[]} ref={ref} style={{ height: '5rem' }} />);
  expect(ref.current?.style.height).toBe('5rem');
  expect(screen.queryByRole('img')).toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`describes ${name} status segments`, () => {
    render(<Example />);
    const points = screen.getAllByRole('img');
    expect(points.length).toBe(name === 'health' ? 5 : 3);
    for (const point of points)
      expect(point.getAttribute('aria-label')).toContain(
        point.getAttribute('data-status') ?? 'success',
      );
  });
}
