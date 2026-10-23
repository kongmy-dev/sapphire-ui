import { afterEach, expect, it, mock } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from './sidebar.js';

const originalMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMedia;
});

function State() {
  const { state } = useSidebar();
  return <output aria-label="Sidebar state">{state}</output>;
}

function Controlled({ onClick }: { onClick: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <SidebarTrigger onClick={onClick} />
      <State />
    </SidebarProvider>
  );
}

function CloseDesktop() {
  const { setOpen } = useSidebar();
  return (
    <button type="button" onClick={() => setOpen(false)}>
      Close desktop
    </button>
  );
}

it('composes inset navigation sections, search and rail while exposing state updates', async () => {
  render(
    <SidebarProvider>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarInput aria-label="Search navigation" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <h2>Workspace</h2>
            </SidebarGroupLabel>
            <SidebarGroupAction asChild>
              <button type="button">Add project</button>
            </SidebarGroupAction>
            <SidebarGroupContent>
              <a href="#projects">Projects</a>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <a href="#account">Account</a>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <h1>Project list</h1>
        <CloseDesktop />
        <State />
      </SidebarInset>
    </SidebarProvider>,
  );
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Search navigation' }),
    'plan',
  );
  expect(
    screen
      .getByRole('textbox', { name: 'Search navigation' })
      .getAttribute('data-sidebar'),
  ).toBe('input');
  expect(screen.getByRole('heading', { name: 'Workspace' })).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Add project' })).not.toBeNull();
  expect(screen.getByRole('link', { name: 'Account' })).not.toBeNull();
  const rail = screen.getByRole('button', { name: 'Toggle Sidebar' });
  expect(rail.getAttribute('tabindex')).toBe('-1');
  fireEvent.click(rail);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  fireEvent.click(rail);
  fireEvent.click(screen.getByRole('button', { name: 'Close desktop' }));
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
});

it('toggles desktop state through a linked trigger without cookies or implicit shortcuts', () => {
  const cookie = document.cookie;
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
  const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
  const target = document.getElementById(
    trigger.getAttribute('aria-controls') ?? '',
  );
  expect(target?.contains(screen.getByRole('link', { name: 'Overview' }))).toBe(
    true,
  );
  fireEvent.click(trigger);
  expect(trigger.getAttribute('aria-expanded')).toBe('false');
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  expect(document.cookie).toBe(cookie);
  fireEvent.keyDown(window, { key: 'b', ctrlKey: true });
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
});

it('preserves controlled state and caller trigger handlers', () => {
  const clicked = mock();
  render(<Controlled onClick={clicked} />);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  fireEvent.click(screen.getByRole('button', { name: 'Toggle Sidebar' }));
  expect(clicked).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('expanded');
});

it('supports observer-only callbacks and lets caller prevention suppress toggling', () => {
  const changed = mock();
  const view = render(
    <SidebarProvider onOpenChange={changed}>
      <SidebarTrigger />
      <State />
    </SidebarProvider>,
  );
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenCalledWith(false);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  view.rerender(
    <SidebarProvider onOpenChange={changed}>
      <SidebarTrigger onClick={(event) => event.preventDefault()} />
      <State />
    </SidebarProvider>,
  );
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
});

it('renders a single named mobile drawer, restores focus and closes across breakpoint round trips', async () => {
  const media = originalMedia('(width < 48rem)');
  let mobile = true;
  Object.defineProperty(media, 'matches', {
    configurable: true,
    get: () => mobile,
  });
  window.matchMedia = () => media;
  const resize = (next: boolean) =>
    act(() => {
      mobile = next;
      media.dispatchEvent(new Event('change'));
    });
  render(
    <SidebarProvider defaultOpen={false}>
      <Sidebar>
        <a href="#home">Home</a>
      </Sidebar>
      <SidebarTrigger />
      <State />
    </SidebarProvider>,
  );
  const trigger = screen.getByRole('button', { name: 'Toggle Sidebar' });
  expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Sidebar' });
  expect(dialog.id).toBe(trigger.getAttribute('aria-controls') ?? '');
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1);
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  await userEvent.click(trigger);
  resize(false);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getByLabelText('Sidebar state').textContent).toBe('collapsed');
  resize(true);
  expect(screen.queryByRole('dialog')).toBeNull();
});

it('keeps noncollapsible and right floating sidebar variants', () => {
  const view = render(
    <SidebarProvider>
      <Sidebar collapsible="none">Fixed</Sidebar>
    </SidebarProvider>,
  );
  expect(screen.getByText('Fixed').getAttribute('data-slot')).toBe('sidebar');
  view.rerender(
    <SidebarProvider>
      <Sidebar side="right" variant="floating" collapsible="icon">
        Floating
      </Sidebar>
    </SidebarProvider>,
  );
  expect(
    screen
      .getByText('Floating')
      .closest('[data-side]')
      ?.getAttribute('data-side'),
  ).toBe('right');
});

it('requires a provider instead of silently accepting an invalid composition', () => {
  expect(() => render(<State />)).toThrow(
    'useSidebar must be used within a SidebarProvider',
  );
});
