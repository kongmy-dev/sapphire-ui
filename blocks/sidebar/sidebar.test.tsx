import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from './sidebar.js';

function State() {
  const { state } = useSidebar();
  return <output aria-label="Sidebar state">{state}</output>;
}

it('toggles desktop state from trigger and keyboard', () => {
  render(
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/overview">Overview</a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarTrigger />
      <State />
    </SidebarProvider>,
  );
  expect(
    screen.getByRole('link', { name: 'Overview' }).getAttribute('href'),
  ).toBe('/overview');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('expanded');
});

it('preserves controlled state and caller trigger handlers', () => {
  const clicked = mock(() => {});
  function Controlled() {
    const [open, setOpen] = useState(false);
    return (
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <SidebarTrigger onClick={clicked} />
        <State />
      </SidebarProvider>
    );
  }
  render(<Controlled />);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('expanded');
});

it('requires a provider instead of silently accepting an invalid composition', () => {
  expect(() => render(<State />)).toThrow(
    'useSidebar must be used within a SidebarProvider',
  );
});
