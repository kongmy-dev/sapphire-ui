import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu as Primitive } from 'radix-ui';
import { createRef } from 'react';
import { examples } from './dropdown-menu.examples.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from './dropdown-menu.js';

it('supports selection, cancelled selection, disabled items, refs and keyboard return', async () => {
  const content = createRef<HTMLDivElement>();
  const item = createRef<HTMLDivElement>();
  const change = mock();
  const disabled = mock();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent ref={content} className="custom">
        <DropdownMenuItem
          ref={item}
          className="item"
          onSelect={(event) => {
            event.preventDefault();
            change();
          }}
        >
          Keep open
        </DropdownMenuItem>
        <DropdownMenuItem disabled onSelect={disabled}>
          Locked
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={change}>Run</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  const trigger = screen.getByRole('button', { name: 'Actions' });
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(content.current?.className).toBe('sp-dropdown-menu custom');
  expect(item.current?.className).toBe('sp-dropdown-menu-item item');
  await userEvent.click(screen.getByRole('menuitem', { name: 'Keep open' }));
  expect(change).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('menu')).not.toBeNull();
  fireEvent.click(screen.getByRole('menuitem', { name: 'Locked' }));
  expect(disabled).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('menuitem', { name: 'Run' }));
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  expect(change).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it('preserves primitive portal and submenu composition', async () => {
  const select = mock();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Nested actions</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuSub>
          <Primitive.SubTrigger>More</Primitive.SubTrigger>
          <DropdownMenuPortal>
            <Primitive.SubContent>
              <DropdownMenuItem onSelect={select}>Export</DropdownMenuItem>
            </Primitive.SubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  screen.getByRole('button').focus();
  await userEvent.keyboard('{Enter}');
  const more = screen.getByRole('menuitem', { name: 'More' });
  more.focus();
  await userEvent.keyboard('{ArrowRight}');
  await userEvent.click(
    await screen.findByRole('menuitem', { name: 'Export' }),
  );
  expect(select).toHaveBeenCalledTimes(1);
});

for (const { name, render: Example } of examples)
  it(`operates ${name}`, async () => {
    render(<Example />);
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    if (name === 'actions') {
      await userEvent.click(screen.getByRole('menuitem', { name: /Edit/ }));
      expect(screen.getByRole('status').textContent).toBe('Edited');
      screen.getByRole('button').focus();
      await userEvent.keyboard('{Enter}');
      await userEvent.click(
        screen.getByRole('menuitem', { name: 'Duplicate' }),
      );
      expect(screen.getByRole('status').textContent).toBe('Duplicated');
    } else {
      await userEvent.click(
        screen.getByRole('menuitemcheckbox', { name: 'Show sidebar' }),
      );
      expect(
        screen.getByRole('menuitemcheckbox').getAttribute('aria-checked'),
      ).toBe('false');
      await userEvent.click(
        screen.getByRole('menuitemradio', { name: 'Compact' }),
      );
      expect(screen.getByRole('status').textContent).toBe(
        'Sidebar hidden; compact',
      );
    }
  });
