import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './button.examples.js';
import { Button } from './button.js';

it('preserves native attributes, ref, class and form behavior', async () => {
  const clicked = mock(() => {});
  const submitted = mock((event: React.FormEvent) => event.preventDefault());
  const ref = createRef<HTMLButtonElement>();
  render(
    <form onSubmit={submitted}>
      <Button
        ref={ref}
        className="custom"
        name="action"
        value="save"
        onClick={clicked}
      >
        Save
      </Button>
    </form>,
  );
  const button = screen.getByRole('button', { name: 'Save' });
  expect<HTMLElement | null>(ref.current).toBe(button);
  expect(button.className).toBe('sp-button custom');
  expect(button.getAttribute('name')).toBe('action');
  expect(button.getAttribute('value')).toBe('save');
  await userEvent.click(button);
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(submitted).toHaveBeenCalledTimes(1);
});

it('represents variant, size and full width without design utilities', () => {
  const { rerender } = render(
    <Button variant="brand" size="lg" fullWidth>
      Action
    </Button>,
  );
  const button = screen.getByRole('button');
  expect(button.dataset.variant).toBe('brand');
  expect(button.dataset.size).toBe('lg');
  expect(button.hasAttribute('data-full-width')).toBe(true);
  rerender(
    <Button variant={null} size={null} fullWidth={null}>
      Action
    </Button>,
  );
  expect(button.hasAttribute('data-variant')).toBe(false);
  expect(button.hasAttribute('data-size')).toBe(false);
  expect(button.hasAttribute('data-full-width')).toBe(false);
});

it('renders icons on either side and hides them while loading', () => {
  const icon = <svg aria-label="symbol" />;
  const { rerender } = render(<Button icon={icon}>Save</Button>);
  const button = screen.getByRole('button');
  expect(button.firstElementChild?.tagName).toBe('svg');
  rerender(
    <Button icon={icon} iconPosition="end">
      Save
    </Button>,
  );
  expect(button.lastElementChild?.tagName).toBe('svg');
  rerender(
    <Button icon={icon} loading>
      Save
    </Button>,
  );
  expect(button.querySelector('svg')).toBeNull();
  expect(button.getAttribute('aria-busy')).toBe('true');
  expect(button.hasAttribute('disabled')).toBe(true);
});

it('preserves enabled slotted child handler precedence, refs and anchor navigation', async () => {
  const calls: string[] = [];
  const ref = createRef<HTMLButtonElement>();
  const childRef = createRef<HTMLAnchorElement>();
  render(
    <Button asChild ref={ref} onClick={() => calls.push('parent')}>
      <a
        href="#enabled"
        ref={childRef}
        className="link"
        onClick={() => calls.push('child')}
      >
        Visit
      </a>
    </Button>,
  );
  const link = screen.getByRole('link');
  expect<HTMLElement | null>(ref.current).toBe(link);
  expect<HTMLElement | null>(childRef.current).toBe(link);
  expect(link.className).toBe('sp-button link');
  await userEvent.click(link);
  expect(calls).toEqual(['child', 'parent']);
  expect(link.getAttribute('href')).toBe('#enabled');
});

for (const state of ['disabled', 'loading'] as const) {
  it(`blocks ${state} slotted link callbacks and default activation`, () => {
    const callback = mock(() => {});
    const { rerender } = render(
      <Button
        asChild
        disabled={state === 'disabled'}
        loading={state === 'loading'}
        onClick={callback}
        onClickCapture={callback}
        onKeyDown={callback}
        onPointerDown={callback}
      >
        <a
          href="#blocked"
          onClick={callback}
          onClickCapture={callback}
          onKeyDownCapture={callback}
          onPointerDownCapture={callback}
        >
          Blocked
        </a>
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(fireEvent.click(link)).toBe(false);
    expect(fireEvent.keyDown(link, { key: 'Enter' })).toBe(false);
    expect(fireEvent.pointerDown(link)).toBe(false);
    expect(
      fireEvent(
        link,
        new MouseEvent('auxclick', { bubbles: true, cancelable: true }),
      ),
    ).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    rerender(
      <Button asChild>
        <a href="#blocked" onClick={callback}>
          Blocked
        </a>
      </Button>,
    );
    fireEvent.click(screen.getByRole('link'));
    expect(callback).toHaveBeenCalledTimes(1);
  });
}

it('keeps a loading slotted child busy even when its own attributes conflict', () => {
  render(
    <Button asChild loading>
      <a href="#busy" aria-busy={false} aria-disabled={false}>
        Saving link
      </a>
    </Button>,
  );
  const link = screen.getByRole('link');
  expect(link.getAttribute('aria-busy')).toBe('true');
  expect(link.getAttribute('aria-disabled')).toBe('true');
});

it('disables native activation and keeps an explicit accessible busy state', () => {
  const callback = mock(() => {});
  render(
    <Button disabled onClick={callback} aria-busy>
      Unavailable
    </Button>,
  );
  fireEvent.click(screen.getByRole('button'));
  expect(callback).not.toHaveBeenCalled();
  expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-button')).not.toBeNull();
  });
}
