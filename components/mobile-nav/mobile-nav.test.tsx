import { afterEach, expect, test } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { examples } from './mobile-nav.examples.js';
import { MobileNav } from './mobile-nav.js';

const originalMedia = window.matchMedia;
const originalUrl = window.location.href;
afterEach(() => {
  window.matchMedia = originalMedia;
  window.location.href = originalUrl;
  document.body.style.overflow = '';
});

test('opens a named modal traps nested focus and restores focus with scroll state', async () => {
  document.body.style.overflow = 'clip';
  const view = render(
    <MobileNav
      brandName="Sapphire"
      brandSuffix="UI"
      version="v4"
      navItems={[{ href: '/overview', label: 'Overview' }]}
      extraActions={
        <form aria-label="Navigation search">
          <input aria-label="Search" />
          <button type="button">Search action</button>
        </form>
      }
    />,
  );
  const trigger = screen.getByRole('button', {
    name: 'Toggle navigation menu',
  });
  await userEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Sapphire UI' });
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(
    dialog.contains(screen.getByRole('form', { name: 'Navigation search' })),
  ).toBe(true);
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Close navigation menu' }),
    ),
  );
  for (let index = 0; index < 7; index++) {
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  }
  fireEvent.keyDown(dialog, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(document.body.style.overflow).toBe('clip');
  await userEvent.click(trigger);
  view.unmount();
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).toBe('clip');
});

test('tracks popstate when pathname is uncontrolled and honors explicit active overrides', async () => {
  window.location.href = 'https://example.test/overview';
  render(
    <MobileNav
      brandName="Navigation"
      navItems={[
        { href: '/overview', label: 'Overview' },
        { href: '/settings', label: 'Settings' },
        { href: '/forced', label: 'Forced', active: true },
        { href: '/overview-again', label: 'Inactive', active: false },
      ]}
    />,
  );
  await userEvent.click(screen.getByRole('button'));
  expect(
    screen.getByRole('link', { name: 'Overview' }).getAttribute('aria-current'),
  ).toBe('page');
  act(() => {
    window.location.href = 'https://example.test/settings';
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(
    screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current'),
  ).toBe('page');
  expect(
    screen.getByRole('link', { name: 'Overview' }).hasAttribute('aria-current'),
  ).toBe(false);
  expect(
    screen.getByRole('link', { name: 'Forced' }).getAttribute('aria-current'),
  ).toBe('page');
  expect(
    screen.getByRole('link', { name: 'Inactive' }).hasAttribute('aria-current'),
  ).toBe(false);
  await userEvent.click(
    screen.getByRole('button', { name: 'Close navigation menu' }),
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

test('closes at the desktop breakpoint and renders closed navigation on the server', async () => {
  const media = originalMedia('(min-width: 48rem)');
  window.matchMedia = () => media;
  render(<MobileNav brandName="Navigation" navItems={[]} />);
  await userEvent.click(screen.getByRole('button'));
  expect(screen.getByRole('dialog')).not.toBeNull();
  act(() => {
    Object.defineProperty(media, 'matches', {
      configurable: true,
      value: true,
    });
    media.dispatchEvent(new Event('change'));
  });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(
    renderToString(<MobileNav brandName="Navigation" navItems={[]} />),
  ).not.toContain('role="dialog"');
});

for (const example of examples) {
  test(`example ${example.name} preserves router and native navigation behavior`, async () => {
    render(createElement(example.render));
    const trigger = screen.getByRole('button', {
      name:
        example.name === 'links'
          ? 'Toggle navigation menu'
          : 'Open workspace navigation',
    });
    await userEvent.click(trigger);
    if (example.name === 'links') {
      fireEvent.submit(
        screen.getByRole('searchbox').closest('form') ??
          screen.getByRole('dialog'),
      );
      fireEvent.click(screen.getByRole('link', { name: 'Guide' }));
    } else {
      await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
      expect(screen.getByRole('status').textContent).toBe(
        'Current route: /settings',
      );
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      await userEvent.click(trigger);
      expect(
        screen
          .getByRole('link', { name: 'Settings' })
          .getAttribute('aria-current'),
      ).toBe('page');
      await userEvent.click(
        screen.getByRole('button', { name: 'Close workspace navigation' }),
      );
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
}
