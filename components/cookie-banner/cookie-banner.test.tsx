import { afterEach, expect, it, mock } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { getConsentStatus, setConsentStatus } from '../../lib/consent.js';
import { examples } from './cookie-banner.examples.js';
import { CookieBanner } from './cookie-banner.js';

const cookie = Object.getOwnPropertyDescriptor(document, 'cookie');
afterEach(() => {
  document.documentElement.removeAttribute('data-sapphire-consent');
  if (cookie) Object.defineProperty(document, 'cookie', cookie);
  else Reflect.deleteProperty(document, 'cookie');
});

function emptyCookies() {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value: '',
  });
}

it('waits until hydration before showing pending consent and saves an explicit choice', () => {
  emptyCookies();
  expect(renderToString(<CookieBanner />)).toBe('');
  const close = mock(() => {});
  render(<CookieBanner onClose={close} />);
  expect(
    screen.getByRole('complementary', { name: 'We value your privacy' }),
  ).not.toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Accept' }));
  expect(getConsentStatus()).toEqual({ analytics: true });
  expect(screen.queryByRole('complementary')).toBeNull();
  expect(close).toHaveBeenCalledTimes(1);
});

it('stays hidden for a saved choice, reopens when forced and supports withdrawal without a callback', () => {
  emptyCookies();
  setConsentStatus({ analytics: true });
  const { rerender, unmount } = render(<CookieBanner />);
  expect(screen.queryByRole('complementary')).toBeNull();
  rerender(<CookieBanner forceShow />);
  fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
  expect(getConsentStatus()).toEqual({ analytics: false });
  expect(screen.queryByRole('complementary')).toBeNull();
  rerender(<CookieBanner forceShow={false} />);
  rerender(<CookieBanner forceShow />);
  expect(screen.getByRole('complementary')).not.toBeNull();
  unmount();
});

it('cancels its pending tracker listener on unmount', () => {
  emptyCookies();
  const { unmount } = render(<CookieBanner />);
  fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
  unmount();
  const sync = mock((_value: unknown) => {});
  Object.defineProperty(window, 'zaraz', {
    configurable: true,
    value: { consent: { set: sync } },
  });
  document.dispatchEvent(new Event('zarazConsentAPIReady'));
  expect(sync).not.toHaveBeenCalled();
  Reflect.deleteProperty(window, 'zaraz');
});

for (const { name, render: Example } of examples) {
  it(`reopens the ${name} example after saving`, () => {
    emptyCookies();
    render(<Example />);
    fireEvent.click(screen.getByRole('button', { name: 'Decline' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cookie preferences' }));
    expect(screen.getByRole('complementary')).not.toBeNull();
  });
}
