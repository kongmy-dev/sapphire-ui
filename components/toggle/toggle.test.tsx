import { expect, test } from 'bun:test';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, createRef, useState } from 'react';
import { examples } from './toggle.examples.js';
import { Toggle, ToggleGroup, ToggleGroupItem } from './toggle.js';

test('toggles with Space and Enter while preserving native refs and disabled state', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <>
      <Toggle
        ref={ref}
        className="custom"
        aria-label="Bold"
        variant={null}
        size={null}
      >
        B
      </Toggle>
      <Toggle disabled aria-label="Disabled">
        D
      </Toggle>
    </>,
  );
  const button = screen.getByRole('button', { name: 'Bold' });
  expect<HTMLElement | null>(ref.current).toBe(button);
  expect(button.className).toBe('sp-toggle custom');
  expect(button.hasAttribute('data-variant')).toBe(false);
  await userEvent.tab();
  await userEvent.keyboard(' ');
  expect(button.getAttribute('aria-pressed')).toBe('true');
  await userEvent.keyboard('{Enter}');
  expect(button.getAttribute('aria-pressed')).toBe('false');
  await userEvent.click(screen.getByRole('button', { name: 'Disabled' }));
  expect(
    screen
      .getByRole('button', { name: 'Disabled' })
      .getAttribute('aria-pressed'),
  ).toBe('false');
});

function ControlledToggle() {
  const [pressed, setPressed] = useState(false);
  return (
    <Toggle pressed={pressed} onPressedChange={setPressed}>
      Controlled
    </Toggle>
  );
}

test('supports controlled toggles', async () => {
  render(<ControlledToggle />);
  const button = screen.getByRole('button');
  await userEvent.click(button);
  expect(button.getAttribute('aria-pressed')).toBe('true');
});

test('inherits group appearance with item overrides and retains group refs', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <ToggleGroup
      ref={ref}
      type="multiple"
      variant="outline"
      size="lg"
      aria-label="Formatting"
    >
      <ToggleGroupItem value="bold" variant={null} size={null}>
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" variant="ghost" size="sm">
        Italic
      </ToggleGroupItem>
    </ToggleGroup>,
  );
  expect<HTMLElement | null>(ref.current).toBe(screen.getByRole('toolbar'));
  expect(
    screen.getByRole('button', { name: 'Bold' }).getAttribute('data-variant'),
  ).toBe('outline');
  expect(
    screen.getByRole('button', { name: 'Bold' }).getAttribute('data-size'),
  ).toBe('lg');
  expect(
    screen.getByRole('button', { name: 'Italic' }).getAttribute('data-variant'),
  ).toBe('ghost');
});

for (const example of examples) {
  test(`example ${example.name} changes selection using its public controls`, async () => {
    render(createElement(example.render));
    if (example.name === 'alignment') {
      const first = screen.getByRole('radio', { name: 'Align left' });
      act(() => first.focus());
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(
        screen.getByRole('radio', { name: 'Align center' }),
      );
      await userEvent.keyboard(' ');
      expect(
        screen
          .getByRole('radio', { name: 'Align center' })
          .getAttribute('aria-checked'),
      ).toBe('true');
    } else {
      const button = screen.getAllByRole('button')[0];
      if (button === undefined) throw new Error('Example has no action');
      const previous = button.getAttribute('aria-pressed');
      await userEvent.click(button);
      expect(button.getAttribute('aria-pressed')).not.toBe(previous);
    }
  });
}
