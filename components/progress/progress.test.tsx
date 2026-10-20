import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './progress.examples.js';
import { Progress } from './progress.js';

test('exposes custom range and value text on the progressbar and forwards its ref', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Progress
      ref={ref}
      value={4}
      max={8}
      aria-label="Upload"
      getValueLabel={(value, max) => `${value} of ${max} files`}
      showLabel
      className="consumer"
      indicatorClassName="indicator"
    />,
  );
  const bar = screen.getByRole('progressbar', { name: 'Upload' });
  expect(ref.current === bar).toBe(true);
  expect(bar.getAttribute('aria-valuenow')).toBe('4');
  expect(bar.getAttribute('aria-valuemax')).toBe('8');
  expect(bar.getAttribute('aria-valuetext')).toBe('4 of 8 files');
  expect(screen.getByText('50%')).toBeTruthy();
});

test('represents invalid values as indeterminate without displaying a false percentage', () => {
  const view = render(
    <Progress value={Number.NaN} max={0} showLabel aria-label="Upload" />,
  );
  const bar = screen.getByRole('progressbar');
  expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  expect(bar.getAttribute('aria-valuemax')).toBe('100');
  expect(screen.getByText('…')).toBeTruthy();
  view.rerender(<Progress value={120} aria-label="Upload" />);
  expect(bar.hasAttribute('aria-valuenow')).toBe(false);
  view.rerender(<Progress aria-label="Upload" />);
  expect(bar.getAttribute('aria-valuenow')).toBe('0');
});

test('renders every published progress example with a named progressbar', () => {
  for (const { render: Example } of examples) {
    const view = render(<Example />);
    expect(screen.getAllByRole('progressbar')).toHaveLength(3);
    view.unmount();
  }
});
