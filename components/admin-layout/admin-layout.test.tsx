import { expect, it, mock } from 'bun:test';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './admin-layout.examples.js';
import {
  AdminHeader,
  type AdminHeaderProps,
  AdminLayout,
  type AdminLayoutProps,
  AdminSidebar,
  AdminSidebarLink,
  type AdminSidebarLinkProps,
  type AdminSidebarProps,
  AdminSidebarSection,
  type AdminSidebarSectionProps,
} from './admin-layout.js';

it('preserves native props, refs, optional slots and content width', () => {
  const root = createRef<HTMLDivElement>();
  const sidebar = createRef<HTMLElement>();
  const section = createRef<HTMLDivElement>();
  const link = createRef<HTMLAnchorElement>();
  const header = createRef<HTMLElement>();
  const linkProps = {
    href: '#settings',
    ref: link,
    active: true,
    className: 'link',
    children: 'Settings',
  } satisfies AdminSidebarLinkProps;
  const sectionProps = {
    ref: section,
    className: 'section',
    children: <AdminSidebarLink {...linkProps} />,
  } satisfies AdminSidebarSectionProps;
  const sidebarProps = {
    ref: sidebar,
    className: 'sidebar',
    children: <AdminSidebarSection {...sectionProps} />,
  } satisfies AdminSidebarProps;
  const headerProps = {
    ref: header,
    className: 'header',
    leftSlot: 'Search',
    rightSlot: 'Account',
    breadcrumbs: 'Home',
  } satisfies AdminHeaderProps;
  const props = {
    ref: root,
    className: 'root',
    id: 'workspace',
    sidebar: <AdminSidebar {...sidebarProps} />,
    header: <AdminHeader {...headerProps} />,
    contentClassName: 'content',
    contentMaxWidth: '60rem',
    children: <h1>Workspace</h1>,
  } satisfies AdminLayoutProps;
  render(<AdminLayout {...props} />);
  expect(root.current?.className).toBe('sp-admin-layout root');
  expect(sidebar.current?.className).toBe('sp-admin-layout-sidebar sidebar');
  expect(section.current?.className).toBe('section');
  expect(header.current?.className).toBe('sp-admin-layout-header header');
  expect(link.current?.className).toBe('sp-admin-layout-link link');
  expect(link.current?.getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('main').style.maxWidth).toBe('60rem');
  expect(screen.getByRole('main').className).toBe(
    'sp-admin-layout-content content',
  );
});

it('keeps collapsed links named, forwards slotted refs and child handler precedence', async () => {
  const order: string[] = [];
  const ref = createRef<HTMLAnchorElement>();
  render(
    <AdminSidebar>
      <AdminSidebarSection title="Hidden section" collapsed>
        <AdminSidebarLink
          ref={ref}
          asChild
          collapsed
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
        <AdminSidebarLink collapsed href="#home" aria-current="location">
          Home
        </AdminSidebarLink>
      </AdminSidebarSection>
    </AdminSidebar>,
  );
  const projects = screen.getByRole('link', { name: 'Projects' });
  expect<HTMLElement | null>(ref.current).toBe(projects);
  expect(screen.queryByText('2')).toBeNull();
  expect(screen.queryByText('Hidden section')).toBeNull();
  expect(
    screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current'),
  ).toBe('location');
  await userEvent.click(projects);
  expect(order).toEqual(['child', 'parent']);
});

it('uses initial uncontrolled collapsed state and respects controlled toggle callbacks', async () => {
  const toggle = mock();
  const { rerender } = render(
    <AdminSidebar
      collapsed
      brand={<a href="#brand">Brand</a>}
      expandLabel="Open navigation"
      collapseLabel="Close navigation"
    />,
  );
  expect(screen.getByText('Brand').closest('[inert]')).not.toBeNull();
  await userEvent.click(
    screen.getByRole('button', { name: 'Open navigation' }),
  );
  expect(
    screen
      .getByRole('button', { name: 'Close navigation' })
      .getAttribute('aria-expanded'),
  ).toBe('true');
  expect(
    screen.getByRole('link', { name: 'Brand' }).closest('[inert]'),
  ).toBeNull();
  rerender(<AdminSidebar collapsed onToggleCollapse={toggle} />);
  await userEvent.click(screen.getByRole('button', { name: 'Expand sidebar' }));
  expect(toggle).toHaveBeenCalledWith(false);
  expect(
    screen
      .getByRole('button', { name: 'Expand sidebar' })
      .getAttribute('aria-expanded'),
  ).toBe('false');
});

for (const { name, render: Example } of examples)
  it(`operates ${name} sidebar by keyboard`, async () => {
    render(<Example />);
    const toggle = screen.getByRole('button');
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    expect(toggle.getAttribute('aria-expanded')).toBe(
      name === 'workspace' ? 'false' : 'true',
    );
    await userEvent.keyboard(' ');
    expect(toggle.getAttribute('aria-expanded')).toBe(
      name === 'workspace' ? 'true' : 'false',
    );
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
