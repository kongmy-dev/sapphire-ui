import { expect, it, mock, spyOn } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { examples } from './command-palette.examples.js';
import { CommandPalette, type CommandPaletteProps } from './command-palette.js';

it('filters by label and hint, selects by keyboard with raw query and clamps navigation', async () => {
  const select = mock();
  const close = mock();
  const scroll = spyOn(HTMLElement.prototype, 'scrollIntoView');
  const props = {
    open: true,
    onOpenChange: close,
    items: [
      { id: 'one', label: 'First', hint: 'Alpha', onSelect: select },
      { id: 'two', label: 'Second', onSelect: select },
    ],
  } satisfies CommandPaletteProps;
  render(<CommandPalette {...props} />);
  const input = screen.getByRole('combobox', { name: 'Search commands' });
  await waitFor(() => expect(document.activeElement).toBe(input));
  const list = screen.getByRole('listbox', { name: 'Command results' });
  expect(input.getAttribute('aria-controls')).toBe(list.id);
  await userEvent.keyboard('{ArrowUp}{ArrowDown}{ArrowDown}');
  expect(
    screen
      .getByRole('option', { name: 'Second' })
      .getAttribute('aria-selected'),
  ).toBe('true');
  await userEvent.type(input, ' ALPHA ');
  expect(screen.getAllByRole('option')).toHaveLength(1);
  expect(screen.getByRole('option').getAttribute('aria-selected')).toBe('true');
  await userEvent.keyboard('{Enter}');
  expect(select).toHaveBeenCalledWith(' ALPHA ');
  expect(close).toHaveBeenCalledWith(false);
  expect(scroll).toHaveBeenCalled();
  scroll.mockRestore();
});

it('keeps empty results stable, supports replacement data and pointer selection', async () => {
  const select = mock();
  const close = mock();
  const { rerender } = render(
    <CommandPalette open onOpenChange={close} items={[]} />,
  );
  const input = screen.getByRole('combobox');
  await userEvent.type(input, 'missing');
  await userEvent.keyboard('{ArrowDown}{ArrowUp}{Enter}');
  expect(close).not.toHaveBeenCalled();
  expect(input.hasAttribute('aria-activedescendant')).toBe(false);
  expect(screen.getByRole('status').textContent).toContain('missing');
  await userEvent.clear(input);
  rerender(
    <CommandPalette
      open
      onOpenChange={close}
      items={[{ id: 'same', label: 'Available', onSelect: select }]}
    />,
  );
  const option = screen.getByRole('option');
  fireEvent.mouseEnter(option);
  fireEvent.mouseDown(option);
  await userEvent.click(option);
  expect(select).toHaveBeenCalledWith('');
  expect(close).toHaveBeenCalledWith(false);
});

it('resets search on reopening and preserves keyboard option activation', async () => {
  const select = mock();
  const close = mock();
  const items = [
    { id: 'same', label: 'First', onSelect: select },
    { id: 'second', label: 'Second', onSelect: select },
  ];
  const { rerender } = render(
    <CommandPalette open onOpenChange={close} items={items} />,
  );
  await userEvent.type(screen.getByRole('combobox'), 'Second');
  const option = screen.getByRole('option');
  fireEvent.keyDown(option, { key: 'Tab' });
  expect(select).not.toHaveBeenCalled();
  fireEvent.keyDown(option, { key: ' ' });
  expect(select).toHaveBeenCalledWith('Second');
  rerender(<CommandPalette open={false} onOpenChange={close} items={items} />);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  rerender(<CommandPalette open onOpenChange={close} items={items} />);
  expect(screen.getByRole('combobox').getAttribute('value')).toBe('');
  expect(screen.getAllByRole('option')).toHaveLength(2);
});

for (const { name, render: Example } of examples)
  it(`opens and selects ${name} commands`, async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button'));
    const input = screen.getByRole('combobox');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('status').textContent).toBe(
      name === 'navigation' ? 'Settings' : 'Document published',
    );
    expect(document.activeElement).toBe(screen.getByRole('button'));
    await userEvent.click(screen.getByRole('button'));
    await userEvent.type(
      screen.getByRole('combobox'),
      name === 'navigation' ? 'projects' : 'draft',
    );
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('status').textContent).toBe(
      name === 'navigation' ? 'Projects: projects' : 'Draft saved',
    );
    expect(input.isConnected).toBe(false);
  });
