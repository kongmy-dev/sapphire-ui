import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdminSidebarLink } from '../AdminLayout';

describe('AdminSidebarLink', () => {
  it('renders without crashing as standard anchor', () => {
    render(<AdminSidebarLink href="/dashboard">Dashboard</AdminSidebarLink>);
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders with asChild and merges properties correctly', () => {
    render(
      <AdminSidebarLink asChild icon="home" badge="New">
        <a href="/home" data-testid="custom-link">
          Home Link
        </a>
      </AdminSidebarLink>
    );

    const link = screen.getByTestId('custom-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/home');
    expect(link.tagName).toBe('A');

    // Should render the icon inside the link
    expect(screen.getByText('home')).toHaveClass('material-symbols-outlined');

    // Should render the badge inside the link
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('supports collapsed mode with asChild', () => {
    render(
      <AdminSidebarLink asChild collapsed icon="settings">
        <a href="/settings" data-testid="collapsed-link">
          Settings
        </a>
      </AdminSidebarLink>
    );

    const link = screen.getByTestId('collapsed-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/settings');

    // Label should be sr-only/visually hidden, but present for screen readers
    const textSpan = screen.getByText('Settings');
    expect(textSpan).toHaveClass('sr-only');
  });
});
