import { afterEach, expect, it, mock, spyOn } from 'bun:test';
import { render } from '@testing-library/react';
import { Banner } from '../components/banner/banner.js';
import { BannerElement } from './banner.js';

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

function banner() {
  if (!BannerElement) throw new Error('Browser constructor missing');
  return new BannerElement();
}

it('preserves content and listeners while attributes and connection change', () => {
  const element = banner();
  const input = document.createElement('input');
  input.value = 'Unsubmitted';
  const click = mock();
  input.addEventListener('click', click);
  element.append(input);
  document.body.append(element);
  expect(customElements.get('sapphire-banner')).toBe(BannerElement);
  expect(element.dataset.variant).toBe('info');
  expect(element.querySelector('button')).toBeNull();
  element.setAttribute('variant', 'accent');
  expect(element.dataset.variant).toBe('brand');
  element.setAttribute('variant', 'invalid');
  expect(element.dataset.variant).toBe('info');
  element.setAttribute('variant', 'warning');
  element.setAttribute('dismissible', '');
  element.setAttribute('dismiss-label', 'Close announcement');
  expect(element.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Close announcement',
  );
  const dismissed = mock();
  element.addEventListener('dismiss', dismissed);
  element.remove();
  document.body.append(element);
  element.querySelector('button')?.click();
  expect(dismissed).toHaveBeenCalledTimes(1);
  expect(element.hidden).toBe(true);
  element.show();
  expect(element.hidden).toBe(false);
  expect(input.value).toBe('Unsubmitted');
  input.click();
  expect(click).toHaveBeenCalledTimes(1);
  element.removeAttribute('dismissible');
  expect(element.querySelector('button')).toBeNull();
});

it('persists dismissal, clears it on show and reads changing keys', () => {
  localStorage.setItem('sapphire-banner:first', '1');
  const element = banner();
  element.setAttribute('storage-key', 'first');
  element.setAttribute('dismissible', '');
  document.body.append(element);
  expect(element.hidden).toBe(true);
  expect(element.querySelector('button')).not.toBeNull();
  element.show();
  expect(localStorage.getItem('sapphire-banner:first')).toBeNull();
  element.dismiss();
  expect(localStorage.getItem('sapphire-banner:first')).toBe('1');
  element.setAttribute('storage-key', 'second');
  expect(element.hidden).toBe(false);
  element.dismiss();
  expect(localStorage.getItem('sapphire-banner:second')).toBe('1');
  element.removeAttribute('storage-key');
  expect(element.hidden).toBe(false);
  element.show();
  element.dismiss();
  expect(element.hidden).toBe(true);
});

it('keeps usable dismissal and showing when storage is unavailable', () => {
  const get = spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('Private storage');
  });
  const set = spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota');
  });
  const remove = spyOn(Storage.prototype, 'removeItem').mockImplementation(
    () => {
      throw new Error('Private storage');
    },
  );
  try {
    const element = banner();
    element.setAttribute('storage-key', 'blocked');
    document.body.append(element);
    element.dismiss();
    expect(element.hidden).toBe(true);
    element.show();
    expect(element.hidden).toBe(false);
  } finally {
    get.mockRestore();
    set.mockRestore();
    remove.mockRestore();
  }
});

it('matches React classes and variant data while retaining native events', () => {
  const element = banner();
  element.setAttribute('variant', 'success');
  element.setAttribute('dismissible', '');
  document.body.append(element);
  const twin = render(<Banner variant="success">Message</Banner>);
  const react = twin.container.firstElementChild;
  if (!react) throw new Error('Missing React twin');
  expect(element.className).toBe(react.className);
  expect(element.dataset.slot).toBe(
    react.getAttribute('data-slot') ?? undefined,
  );
  expect(element.dataset.variant).toBe(
    react.getAttribute('data-variant') ?? undefined,
  );
  expect(element.querySelector('button')?.className).toBe(
    react?.querySelector('button')?.className,
  );
  expect(element.querySelector('svg')?.outerHTML).toBe(
    react?.querySelector('svg')?.outerHTML,
  );
});
