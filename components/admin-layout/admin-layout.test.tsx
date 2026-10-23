import { afterEach, expect, it, mock } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './admin-layout.examples.js';
import {
  AdminHeader,
  AdminLayout,
  AdminSidebar,
  AdminSidebarLink,
  AdminSidebarSection,
  AdminSidebarTrigger,
} from './admin-layout.js';

const originalMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMedia;
});

function mobileViewport() {
  const media = originalMedia('(width < 48rem)');
  let mobile = true;
  Object.defineProperty(media, 'matches', {
    configurable: true,
    get: () => mobile,
  });
  window.matchMedia = () => media;
  return (next: boolean) =>
    act(() => {
      mobile = next;
      media.dispatchEvent(new Event('change'));
    });
}

it('preserves native refs, slots, widths and a header preceding navigation and main', () => {
  const root = createRef<HTMLDivElement>();
  const sidebar = createRef<HTMLElement>();
  const section = createRef<HTMLDivElement>();
  const link = createRef<HTMLAnchorElement>();
  const header = createRef<HTMLElement>();
  render(
    <AdminLayout
      ref={root}
      className="root"
      id="workspace"
      contentClassName="content"
      contentMaxWidth="60rem"
      sidebar={
        <AdminSidebar ref={sidebar} className="sidebar" id="custom-sidebar">
          <AdminSidebarSection
            title="Workspace"
            ref={section}
            className="section"
          >
            <AdminSidebarLink
              href="#settings"
              ref={link}
              active
              className="link"
            >
              Settings
            </AdminSidebarLink>
          </AdminSidebarSection>
        </AdminSidebar>
      }
      header={
        <AdminHeader
          ref={header}
          className="header"
          leftSlot="Search"
          rightSlot="Account"
          breadcrumbs="Home"
        >
          Extra
        </AdminHeader>
      }
    >
      <h1>Workspace</h1>
    </AdminLayout>,
  );
  expect(root.current?.className).toBe('sp-admin-layout root');
  expect(root.current?.firstElementChild).toBe(header.current);
  expect(sidebar.current?.className).toBe('sp-admin-layout-sidebar sidebar');
  expect(sidebar.current?.id).toBe('custom-sidebar');
  expect(section.current?.className).toBe('section');
  expect(header.current?.className).toBe('sp-admin-layout-header header');
  expect(link.current?.className).toBe('sp-admin-layout-link link');
  expect(link.current?.getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('navigation', { name: 'Workspace' })).not.toBeNull();
  expect(screen.getByRole('main').style.maxWidth).toBe('60rem');
  expect(screen.getByRole('main').className).toBe(
    'sp-admin-layout-content content',
  );
  expect(header.current?.textContent).toContain('Extra');
  const controls = screen.getByRole('button').getAttribute('aria-controls');
  expect(
    document.getElementById(controls ?? '')?.contains(sidebar.current),
  ).toBe(true);
});

it('uses root-controlled state and permits callback-only observers without freezing', async () => {
  const changed = mock();
  const view = render(
    <AdminLayout onDesktopStateChange={changed} sidebar={<AdminSidebar />}>
      <h1>Home</h1>
    </AdminLayout>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse sidebar' }),
  );
  expect(
    screen
      .getByRole('button', { name: 'Expand sidebar' })
      .getAttribute('aria-expanded'),
  ).toBe('false');
  expect(changed).toHaveBeenLastCalledWith('compact');
  view.rerender(
    <AdminLayout
      desktopState="compact"
      onDesktopStateChange={changed}
      sidebar={<AdminSidebar />}
    >
      Home
    </AdminLayout>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
  expect(changed).toHaveBeenLastCalledWith('expanded');
  expect(
    screen
      .getByRole('button', { name: 'Expand sidebar' })
      .getAttribute('aria-expanded'),
  ).toBe('false');
  view.rerender(
    <AdminLayout desktopState="expanded" sidebar={<AdminSidebar />}>
      Home
    </AdminLayout>,
  );
  expect(
    screen
      .getByRole('button', { name: 'Collapse sidebar' })
      .getAttribute('aria-expanded'),
  ).toBe('true');
});

it('allows a caller to prevent trigger changes and keeps explicit labels and refs', async () => {
  const ref = createRef<HTMLButtonElement>();
  render(
    <AdminLayout
      header={
        <AdminSidebarTrigger
          ref={ref}
          className="custom"
          aria-label="Toggle workspace"
          onClick={(event) => event.preventDefault()}
        />
      }
      sidebar={<AdminSidebar />}
    >
      Home
    </AdminLayout>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Toggle workspace' }),
  );
  expect(ref.current?.className).toBe('sp-admin-layout-toggle custom');
  expect(ref.current?.getAttribute('aria-expanded')).toBe('true');
});

it('keeps independent shell state and navigation identifiers separate', async () => {
  render(
    <>
      <AdminLayout
        role="region"
        aria-label="First"
        sidebar={
          <AdminSidebar>
            <AdminSidebarLink href="#one">One</AdminSidebarLink>
          </AdminSidebar>
        }
      >
        First content
      </AdminLayout>
      <AdminLayout
        role="region"
        aria-label="Second"
        sidebar={
          <AdminSidebar>
            <AdminSidebarLink href="#two">Two</AdminSidebarLink>
          </AdminSidebar>
        }
      >
        Second content
      </AdminLayout>
    </>,
  );
  const first = within(screen.getByRole('region', { name: 'First' })).getByRole(
    'button',
    { name: 'Collapse sidebar' },
  );
  const second = within(
    screen.getByRole('region', { name: 'Second' }),
  ).getByRole('button', { name: 'Collapse sidebar' });
  expect(first.getAttribute('aria-controls')).not.toBe(
    second.getAttribute('aria-controls'),
  );
  await userEvent.click(first);
  expect(first.getAttribute('aria-expanded')).toBe('false');
  expect(second.getAttribute('aria-expanded')).toBe('true');
});

it('retains compact brand and footer controls and string content', async () => {
  const view = render(
    <AdminLayout
      sidebar={
        <AdminSidebar
          brand={({ compact }) => (
            <a href="#brand">{compact ? 'S' : 'Sapphire'}</a>
          )}
          footer={({ compact }) => (
            <button type="button">{compact ? 'KM' : 'Manage account'}</button>
          )}
        />
      }
    >
      Home
    </AdminLayout>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Collapse sidebar' }),
  );
  expect(screen.getByRole('link', { name: 'S' }).closest('[inert]')).toBeNull();
  expect(screen.getByRole('button', { name: 'KM' })).not.toBeNull();
  view.rerender(
    <AdminLayout
      sidebar={<AdminSidebar brand="Sapphire" footer="Team workspace" />}
    >
      Home
    </AdminLayout>,
  );
  expect(screen.getByText('Sapphire')).not.toBeNull();
  expect(screen.getByText('Team workspace')).not.toBeNull();
});

it('keeps compact slotted link names, badge labels, refs and caller event precedence', async () => {
  const order: string[] = [];
  const ref = createRef<HTMLAnchorElement>();
  render(
    <AdminLayout
      defaultDesktopState="compact"
      sidebar={
        <AdminSidebar>
          <AdminSidebarSection>
            <AdminSidebarLink
              ref={ref}
              asChild
              badge="2"
              icon={<svg aria-hidden="true" />}
              onClick={() => order.push('parent')}
            >
              <a
                href="#projects"
                onClick={(event) => {
                  event.preventDefault();
                  order.push('child');
                }}
              >
                Projects
              </a>
            </AdminSidebarLink>
            <AdminSidebarLink href="#home" aria-current="location">
              Home
            </AdminSidebarLink>
          </AdminSidebarSection>
        </AdminSidebar>
      }
    >
      Workspace
    </AdminLayout>,
  );
  const projects = screen.getByRole('link', { name: 'Projects 2' });
  expect<HTMLElement | null>(ref.current).toBe(projects);
  expect(
    screen.getByRole('link', { name: 'Home' }).getAttribute('data-iconless'),
  ).toBe('true');
  expect(
    screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
  ).toBe('location');
  act(() => projects.focus());
  expect((await screen.findByRole('tooltip')).textContent).toBe('Projects 2');
  await userEvent.click(projects);
  expect(order).toEqual(['child', 'parent']);
});

it('renders only the mobile drawer navigation and restores trigger focus after Escape', async () => {
  mobileViewport();
  document.body.style.overflow = 'clip';
  render(
    <AdminLayout
      defaultDesktopState="compact"
      sidebar={
        <AdminSidebar
          aria-label="Workspace"
          brand="Sapphire"
          closeLabel="Close workspace"
        >
          <AdminSidebarLink href="#home">Home</AdminSidebarLink>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  const trigger = screen.getByRole('button', { name: 'Open navigation' });
  expect(screen.queryByRole('link', { name: 'Home' })).toBeNull();
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Workspace' });
  expect(
    document.getElementById(trigger.getAttribute('aria-controls') ?? ''),
  ).toBe(dialog);
  expect(dialog.querySelector('[data-collapsed]')).toBeNull();
  expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1);
  for (let index = 0; index < 4; index++) {
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(document.body.style.overflow).toBe('clip');
  document.body.style.overflow = '';
});

it('keeps the drawer open for prevented, modified and alternate navigation, closing on ordinary navigation', async () => {
  mobileViewport();
  render(
    <AdminLayout
      sidebar={
        <AdminSidebar>
          <AdminSidebarLink href="#home">Home</AdminSidebarLink>
          <AdminSidebarLink asChild>
            <a href="#prevented" onClick={(event) => event.preventDefault()}>
              Prevented
            </a>
          </AdminSidebarLink>
          <AdminSidebarLink href="#blank" target="_blank">
            New tab
          </AdminSidebarLink>
          <AdminSidebarLink href="#download" download>
            Download
          </AdminSidebarLink>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Open navigation' }),
  );
  await userEvent.click(screen.getByRole('link', { name: 'Prevented' }));
  const link = screen.getByRole('link', { name: 'Home' });
  for (const modifier of [
    { metaKey: true },
    { ctrlKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
  ]) {
    fireEvent.click(link, modifier);
    expect(screen.getByRole('dialog')).not.toBeNull();
  }
  fireEvent.click(screen.getByRole('link', { name: 'New tab' }));
  fireEvent.click(screen.getByRole('link', { name: 'Download' }));
  expect(screen.getByRole('dialog')).not.toBeNull();
  await userEvent.click(link);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('closes mobile state at desktop entry without changing compact preference', async () => {
  const resize = mobileViewport();
  render(
    <AdminLayout
      defaultDesktopState="compact"
      sidebar={
        <AdminSidebar>
          <AdminSidebarLink href="#home">Home</AdminSidebarLink>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Open navigation' }),
  );
  resize(false);
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(screen.getByRole('button', { name: 'Expand sidebar' })).not.toBeNull();
  resize(true);
  expect(screen.queryByRole('dialog')).toBeNull();
  await userEvent.click(
    screen.getByRole('button', { name: 'Open navigation' }),
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Close navigation' }),
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('requires the shell for stateful parts', () => {
  expect(() => render(<AdminSidebar />)).toThrow('AdminLayout');
  expect(() => render(<AdminSidebarTrigger />)).toThrow('AdminLayout');
  expect(() => render(<AdminSidebarLink>Home</AdminSidebarLink>)).toThrow(
    'AdminLayout',
  );
});

for (const { name, render: Example } of examples) {
  it(`operates the ${name} example by keyboard`, async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', {
      name: /^(Expand sidebar|Collapse sidebar)$/,
    });
    const before = trigger.getAttribute('aria-expanded');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger.getAttribute('aria-expanded')).toBe(
      before === 'true' ? 'false' : 'true',
    );
    await userEvent.keyboard(' ');
    expect(trigger.getAttribute('aria-expanded')).toBe(before);
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
}
