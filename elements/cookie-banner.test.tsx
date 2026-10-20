import { afterEach, expect, mock, test } from 'bun:test';
import { fireEvent, render, within } from '@testing-library/react';
import { CookieBanner } from '../components/cookie-banner/cookie-banner.js';
import { getConsentStatus, setConsentStatus } from '../lib/consent.js';
import { examples } from './cookie-banner.examples.js';
import { CookieBannerElement } from './cookie-banner.js';

const cookie = Object.getOwnPropertyDescriptor(document, 'cookie');
afterEach(() => {
  for (const element of document.querySelectorAll(
    'cookie-banner, [data-cookie-example]',
  ))
    element.remove();
  document.documentElement.removeAttribute('data-sapphire-consent');
  if (cookie) Object.defineProperty(document, 'cookie', cookie);
  else Reflect.deleteProperty(document, 'cookie');
});
function banner() {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    writable: true,
    value: '',
  });
  if (!CookieBannerElement) throw new Error('Missing browser constructor');
  return new CookieBannerElement();
}
function contract(root: ParentNode) {
  return Array.from(root.querySelectorAll('[class]')).map((node) => ({
    class: node.getAttribute('class'),
    data: Array.from(node.attributes)
      .filter((attribute) => attribute.name.startsWith('data-'))
      .map((attribute) => [attribute.name, attribute.value]),
  }));
}

test('registers the native tag and renders the React class and data contract', () => {
  const element = banner();
  document.body.append(element);
  const view = render(<CookieBanner forceShow />);
  expect(customElements.get('cookie-banner')).toBe(CookieBannerElement);
  expect(contract(element)).toEqual(contract(view.container));
  const region = within(element).getByRole('complementary', {
    name: 'We value your privacy',
  });
  expect(region.querySelector('a')?.href).toBe('https://kongmy.dev/privacy');
});

test('saves choices, announces close once and supports force-show removal and reopening', async () => {
  const element = banner();
  element.setAttribute('force-show', '');
  const close = mock(() => {});
  element.addEventListener('close', close);
  document.body.append(element);
  fireEvent.click(within(element).getByRole('button', { name: 'Accept' }));
  expect(getConsentStatus()).toEqual({ analytics: true });
  expect(element.hasAttribute('force-show')).toBe(false);
  expect(within(element).queryByRole('complementary')).toBeNull();
  await Bun.sleep(370);
  expect(close).toHaveBeenCalledTimes(1);
  element.open();
  fireEvent.click(within(element).getByRole('button', { name: 'Decline' }));
  expect(getConsentStatus()).toEqual({ analytics: false });
  element.open();
  await Bun.sleep(370);
  expect(close).toHaveBeenCalledTimes(1);
  expect(
    within(element).getByRole('button', { name: 'Accept' }),
  ).not.toBeNull();
});

test('localizes safely, updates connected copy and does not render before connection', () => {
  const element = banner();
  element.setAttribute('heading', '<img src=x>');
  element.setAttribute('description', '<script>bad</script>');
  element.setAttribute('privacy-url', '/privacy');
  element.setAttribute('privacy-label', 'Read policy');
  element.setAttribute('accept-label', 'Yes');
  element.setAttribute('decline-label', 'No');
  expect(element.childElementCount).toBe(0);
  element.open();
  expect(element.childElementCount).toBe(0);
  document.body.append(element);
  expect(
    within(element).getByRole('complementary', { name: '<img src=x>' }),
  ).not.toBeNull();
  expect(element.querySelector('img, script')).toBeNull();
  expect(
    within(element)
      .getByRole('link', { name: 'Read policy' })
      .getAttribute('href'),
  ).toBe('/privacy');
  element.setAttribute('heading', 'Updated');
  expect(
    within(element).getByRole('complementary', { name: 'Updated' }),
  ).not.toBeNull();
  fireEvent.click(within(element).getByRole('button', { name: 'No' }));
});

test('reconnects without duplicate UI or listeners and cancels stale close work', async () => {
  const element = banner();
  const close = mock(() => {});
  element.addEventListener('close', close);
  document.body.append(element);
  setConsentStatus({ analytics: false });
  element.remove();
  await Bun.sleep(370);
  expect(close).not.toHaveBeenCalled();
  document.body.append(element);
  expect(element.childElementCount).toBe(0);
  element.setAttribute('force-show', '');
  expect(element.querySelectorAll('.sp-cookie-banner')).toHaveLength(1);
  element.removeAttribute('force-show');
  expect(element.childElementCount).toBe(0);
  element.remove();
  element.open();
  document.body.append(element);
  expect(element.querySelectorAll('.sp-cookie-banner')).toHaveLength(1);
});

for (const example of examples)
  test(`native cookie example ${example.name}`, () => {
    banner();
    const root = example.render();
    root.setAttribute('data-cookie-example', '');
    document.body.append(root);
    for (const button of within(root).getAllByRole('button'))
      fireEvent.click(button);
    if (example.name === 'choices') {
      fireEvent.click(
        within(root).getByRole('button', { name: 'Reopen privacy choices' }),
      );
      expect(
        within(root).getByRole('button', { name: 'Accept' }),
      ).not.toBeNull();
    }
  });
