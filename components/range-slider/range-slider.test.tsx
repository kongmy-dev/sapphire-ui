import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './range-slider.examples.js';
import { RangeSlider, type RangeSliderProps, Slider } from './range-slider.js';

it('updates uncontrolled values and visible output with keyboard steps and commits', () => {
  const config = {
    defaultValue: [20],
    min: 10,
    max: 50,
    step: 5,
    showValue: true,
    variant: 'light',
    'aria-label': 'Volume',
  } satisfies RangeSliderProps;
  const ref = createRef<HTMLSpanElement>();
  const change = mock((_value: number[]) => {});
  const commit = mock((_value: number[]) => {});
  render(
    <Slider
      ref={ref}
      className="custom"
      {...config}
      onValueChange={change}
      onValueCommit={commit}
    />,
  );
  const thumb = screen.getByRole('slider', { name: 'Volume' });
  expect(ref.current?.className).toBe('sp-range-slider custom');
  expect(ref.current?.dataset.variant).toBe('light');
  expect(thumb.getAttribute('aria-valuemin')).toBe('10');
  expect(thumb.getAttribute('aria-valuemax')).toBe('50');
  thumb.focus();
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(thumb.getAttribute('aria-valuenow')).toBe('25');
  expect(screen.getByText('25')).not.toBeNull();
  expect(change).toHaveBeenCalledWith([25]);
  expect(commit).toHaveBeenCalledWith([25]);
  fireEvent.keyDown(thumb, { key: 'Home' });
  expect(thumb.getAttribute('aria-valuenow')).toBe('10');
  fireEvent.keyDown(thumb, { key: 'End' });
  expect(thumb.getAttribute('aria-valuenow')).toBe('50');
});

it('keeps controlled range values, labels each thumb and respects disabled state', () => {
  const change = mock((_value: number[]) => {});
  const { rerender } = render(
    <RangeSlider
      value={[20, 80]}
      minStepsBetweenThumbs={2}
      step={5}
      aria-label={['Minimum', 'Maximum']}
      aria-labelledby="price"
      onValueChange={change}
      showValue
    />,
  );
  const thumb = screen.getByRole('slider', { name: 'Minimum' });
  expect(screen.getAllByRole('slider').length).toBe(2);
  expect(thumb.getAttribute('aria-labelledby')).toBe('price');
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(change).toHaveBeenCalledWith([25, 80]);
  expect(thumb.getAttribute('aria-valuenow')).toBe('20');
  expect(screen.getByText('20–80')).not.toBeNull();
  rerender(
    <RangeSlider
      value={[20, 80]}
      disabled
      aria-label={['Minimum', 'Maximum']}
      onValueChange={change}
    />,
  );
  fireEvent.keyDown(screen.getByRole('slider', { name: 'Minimum' }), {
    key: 'ArrowRight',
  });
  expect(change).toHaveBeenCalledTimes(1);
});

it('defaults to the supplied minimum and exposes native form values and reset behavior', async () => {
  render(
    <form aria-label="Settings">
      <Slider name="volume" min={10} max={50} aria-label="Volume" showValue />
    </form>,
  );
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Form missing');
  const thumb = screen.getByRole('slider');
  expect(thumb.getAttribute('aria-valuenow')).toBe('10');
  expect(new FormData(form).get('volume')).toBe('10');
  fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  expect(new FormData(form).get('volume')).toBe('11');
  fireEvent.reset(form);
  await waitFor(() => expect(thumb.getAttribute('aria-valuenow')).toBe('10'));
  expect(screen.getByText('10')).not.toBeNull();
  expect(new FormData(form).get('volume')).toBe('10');
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, () => {
    render(<Example />);
    const thumb = screen.getAllByRole('slider')[0];
    if (!thumb) throw new Error('Slider missing');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    if (name === 'controlled') expect(screen.getByText('25–80')).not.toBeNull();
  });
}
