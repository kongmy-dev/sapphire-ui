import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './segmented-bar.examples.js';
import { SegmentedBar } from './segmented-bar.js';

test('preserves labels ref color classes and custom style options', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <SegmentedBar
      ref={ref}
      aria-label="Capacity"
      size="lg"
      className="custom"
      segments={[
        {
          value: 40,
          color: 'red',
          className: 'segment',
          style: { opacity: 0.5 },
        },
      ]}
      markers={[
        {
          position: 75,
          color: 'blue',
          className: 'marker',
          style: { opacity: 0.8 },
        },
      ]}
    />,
  );
  const group = screen.getByRole('group', { name: 'Capacity' });
  expect<HTMLElement | null>(ref.current).toBe(group);
  expect(group.className).toBe('sp-segmented-bar custom');
  expect(group.dataset.size).toBe('lg');
  expect(group.querySelector<HTMLElement>('.segment')?.style.width).toBe('40%');
  expect(
    group.querySelector<HTMLElement>('.segment')?.style.backgroundColor,
  ).toBe('red');
  expect(group.querySelector<HTMLElement>('.segment')?.style.opacity).toBe(
    '0.5',
  );
  expect(group.querySelector<HTMLElement>('.marker')?.style.left).toBe('75%');
  expect(group.querySelector<HTMLElement>('.marker')?.style.borderColor).toBe(
    'blue',
  );
});

test('normalizes overfull segments and clamps invalid values and markers to finite geometry', () => {
  render(
    <SegmentedBar
      segments={[
        { value: 100 },
        { value: 100 },
        { value: -5 },
        { value: Number.NaN },
      ]}
      markers={[
        { position: -10 },
        { position: 150 },
        { position: Number.POSITIVE_INFINITY },
      ]}
    />,
  );
  const group = screen.getByRole('group');
  expect(
    [...group.querySelectorAll<HTMLElement>('.sp-segmented-bar-segment')].map(
      (part) => part.style.width,
    ),
  ).toEqual(['50%', '50%', '0%', '0%']);
  expect(
    [...group.querySelectorAll<HTMLElement>('.sp-segmented-bar-marker')].map(
      (part) => part.style.left,
    ),
  ).toEqual(['0%', '100%', '0%']);
  expect(group.getAttribute('aria-label')).toContain('50%');
});
for (const { name, render: Example } of examples) {
  test(`renders the ${name} segmented bar example with a group label`, () => {
    render(<Example />);
    expect(
      screen
        .getAllByRole('group')
        .every((group) => Boolean(group.getAttribute('aria-label'))),
    ).toBe(true);
  });
}
