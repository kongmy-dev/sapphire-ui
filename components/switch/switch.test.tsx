import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './switch.examples.js';
import { Switch, ToggleSwitch, type ToggleSwitchProps } from './switch.js';

it('supports label activation, Space, refs, native attributes and compact size', async () => {
  const config = {
    size: 'sm',
    label: 'Notifications',
  } satisfies ToggleSwitchProps;
  const ref = createRef<HTMLButtonElement>();
  const change = mock((_checked: boolean) => {});
  render(
    <ToggleSwitch
      ref={ref}
      className="custom"
      id="notifications"
      {...config}
      onCheckedChange={change}
      aria-describedby="help"
    />,
  );
  const control = screen.getByRole('switch', { name: 'Notifications' });
  expect<HTMLElement | null>(ref.current).toBe(control);
  expect(control.className).toBe('sp-switch custom');
  expect(control.dataset.size).toBe('sm');
  expect(control.getAttribute('aria-describedby')).toBe('help');
  await userEvent.click(screen.getByText('Notifications'));
  expect(control.getAttribute('aria-checked')).toBe('true');
  control.focus();
  await userEvent.keyboard(' ');
  expect(control.getAttribute('aria-checked')).toBe('false');
  expect(change.mock.calls).toEqual([[true], [false]]);
});

it('keeps controlled values and ignores disabled activation', async () => {
  const change = mock((_checked: boolean) => {});
  const { rerender } = render(
    <Switch checked aria-label="Enabled" onCheckedChange={change} />,
  );
  const control = screen.getByRole('switch');
  await userEvent.click(control);
  expect(change).toHaveBeenCalledWith(false);
  expect(control.getAttribute('aria-checked')).toBe('true');
  rerender(
    <Switch checked disabled aria-label="Enabled" onCheckedChange={change} />,
  );
  await userEvent.click(control);
  expect(change).toHaveBeenCalledTimes(1);
});

it('submits its form value and resets uncontrolled state', async () => {
  render(
    <form aria-label="Preferences">
      <Switch name="alerts" value="yes" label="Alerts" defaultChecked />
    </form>,
  );
  const form = screen.getByRole('form');
  if (!(form instanceof HTMLFormElement)) throw new Error('Form missing');
  expect(new FormData(form).get('alerts')).toBe('yes');
  await userEvent.click(screen.getByRole('switch'));
  expect(new FormData(form).has('alerts')).toBe(false);
  fireEvent.reset(form);
  await waitFor(() =>
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe(
      'true',
    ),
  );
  expect(new FormData(form).get('alerts')).toBe('yes');
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    render(<Example />);
    const control = screen.getAllByRole('switch')[0];
    if (!control) throw new Error('Switch missing');
    await userEvent.click(control);
    if (name === 'controlled')
      expect(screen.getByRole('status').textContent).toBe('Enabled');
  });
}
