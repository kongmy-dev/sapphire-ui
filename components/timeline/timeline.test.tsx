import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './timeline.examples.js';
import {
  Timeline,
  TimelineContent,
  type TimelineContentProps,
  TimelineIndicator,
  type TimelineIndicatorProps,
  TimelineItem,
  type TimelineItemProps,
  type TimelineProps,
} from './timeline.js';

it('preserves native refs and content across the CSS-oriented parts', () => {
  const root = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  const marker = createRef<HTMLDivElement>();
  const content = createRef<HTMLDivElement>();
  const rootProps = {
    orientation: 'horizontal',
    className: 'custom',
  } satisfies TimelineProps;
  const itemProps = { className: 'item' } satisfies TimelineItemProps;
  const markerProps = {
    isLast: true,
    className: 'marker',
  } satisfies TimelineIndicatorProps;
  const contentProps = { className: 'content' } satisfies TimelineContentProps;
  render(
    <Timeline {...rootProps} ref={root}>
      <TimelineItem {...itemProps} ref={item}>
        <TimelineIndicator {...markerProps} ref={marker}>
          Done
        </TimelineIndicator>
        <TimelineContent {...contentProps} ref={content}>
          <h3>Delivered</h3>
        </TimelineContent>
      </TimelineItem>
    </Timeline>,
  );
  expect(root.current?.getAttribute('data-orientation')).toBe('horizontal');
  expect(root.current?.className).toBe('sp-timeline custom');
  expect(item.current?.className).toBe('sp-timeline-item item');
  expect(marker.current?.hasAttribute('data-last')).toBe(true);
  expect(
    content.current?.contains(
      screen.getByRole('heading', { name: 'Delivered' }),
    ),
  ).toBe(true);
});

for (const { name, render: Example } of examples)
  it(`renders ${name} events`, () => {
    render(<Example />);
    expect(screen.getAllByRole('heading')).toHaveLength(2);
    if (name === 'history')
      expect(
        screen.getByRole('link', { name: 'Read kickoff notes' }),
      ).not.toBeNull();
  });
