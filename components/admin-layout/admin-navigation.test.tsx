import { expect, it } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AdminLayout,
  AdminSidebar,
  AdminSidebarGroup,
  AdminSidebarLink,
} from './admin-layout.js';

it('starts an active group open and keeps disclosure state on repeated activation', async () => {
  render(
    <AdminLayout
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup
            label="Projects"
            active
            icon={<svg aria-hidden="true" />}
          >
            <AdminSidebarLink href="#active" active>
              Active projects
            </AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  const trigger = screen.getByRole('button', { name: 'Projects' });
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  const id = trigger.getAttribute('aria-controls') ?? '';
  expect(document.getElementById(id)).toBe(
    screen.getByRole('navigation', { name: 'Projects' }),
  );
  await userEvent.click(trigger);
  expect(screen.queryByRole('link', { name: 'Active projects' })).toBeNull();
  trigger.focus();
  await userEvent.keyboard('{Enter}');
  expect(
    screen
      .getByRole('link', { name: 'Active projects' })
      .getAttribute('aria-current'),
  ).toBe('page');
});

it('opens a newly active group and renders one-level flyout links with full names', async () => {
  const view = render(
    <AdminLayout
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup label="Records">
            <AdminSidebarLink href="#all">All records</AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  expect(screen.queryByRole('link', { name: 'All records' })).toBeNull();
  view.rerender(
    <AdminLayout
      desktopState="compact"
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup label="Records" active>
            <AdminSidebarLink href="#all" badge={0}>
              All records
            </AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  const trigger = screen.getByRole('button', { name: 'Records' });
  await userEvent.click(trigger);
  expect(screen.getByRole('dialog', { name: 'Records' })).not.toBeNull();
  expect(screen.getByRole('navigation', { name: 'Records' })).not.toBeNull();
  expect(screen.getAllByRole('link', { name: 'All records 0' })).toHaveLength(
    1,
  );
  expect(
    screen
      .getByRole('link', { name: 'All records 0' })
      .getAttribute('aria-describedby'),
  ).toBeNull();
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Records' }), {
    key: 'Escape',
  });
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Records' })).toBeNull(),
  );
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('link', { name: 'All records 0' }));
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Records' })).toBeNull(),
  );
  view.rerender(
    <AdminLayout
      desktopState="expanded"
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup label="Records" active>
            <AdminSidebarLink href="#all">All records</AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  expect(screen.getByRole('link', { name: 'All records' })).not.toBeNull();
});

it('preserves prevented flyout navigation and closes the flyout on presentation changes', async () => {
  const view = render(
    <AdminLayout
      desktopState="compact"
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup label="Settings">
            <AdminSidebarLink
              href="#profile"
              onClick={(event) => event.preventDefault()}
            >
              Profile
            </AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
  await userEvent.click(screen.getByRole('link', { name: 'Profile' }));
  expect(screen.getByRole('dialog', { name: 'Settings' })).not.toBeNull();
  view.rerender(
    <AdminLayout
      desktopState="expanded"
      sidebar={
        <AdminSidebar>
          <AdminSidebarGroup label="Settings">
            <AdminSidebarLink href="#profile">Profile</AdminSidebarLink>
          </AdminSidebarGroup>
        </AdminSidebar>
      }
    >
      Content
    </AdminLayout>,
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Settings' })).toBeNull(),
  );
  expect(
    screen
      .getByRole('button', { name: 'Settings' })
      .getAttribute('aria-expanded'),
  ).toBe('false');
});

it('rejects nested groups instead of introducing a second navigation level', () => {
  expect(() =>
    render(
      <AdminLayout
        sidebar={
          <AdminSidebar>
            <AdminSidebarGroup label="Parent" active>
              <AdminSidebarGroup label="Child">Nested</AdminSidebarGroup>
            </AdminSidebarGroup>
          </AdminSidebar>
        }
      >
        Content
      </AdminLayout>,
    ),
  ).toThrow('one navigation level');
});
