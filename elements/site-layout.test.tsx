import { afterEach, expect, it } from 'bun:test';
import { render } from '@testing-library/react';
import { SiteFooter } from '../components/site-footer/site-footer.js';
import { SiteHeader } from '../components/site-header/site-header.js';
import { SiteFooterElement } from './site-footer.js';
import { SiteHeaderElement } from './site-header.js';

afterEach(() => document.body.replaceChildren());

it('preserves header slots, text, native nav and form state over reconnection', () => {
  if (!SiteHeaderElement) throw new Error('Browser constructor missing');
  const header = new SiteHeaderElement();
  header.innerHTML =
    'Plain text<div data-slot="brand">Brand</div><nav data-slot="nav"><a href="#target">Target</a></nav><form data-slot="actions"><input value="draft"></form><span data-slot="unknown">Extra</span>';
  const nav = header.querySelector('nav');
  const input = header.querySelector('input');
  if (input) input.value = 'Edited';
  document.body.append(header);
  expect(customElements.get('sapphire-site-header')).toBe(SiteHeaderElement);
  expect(header.getAttribute('role')).toBe('banner');
  expect(header.dataset.sticky).toBeUndefined();
  expect(header.querySelector('nav')).toBe(nav);
  expect(header.querySelector('.sp-site-header-inner')?.textContent).toContain(
    'Plain text',
  );
  expect(header.textContent).toContain('Extra');
  header.setAttribute('variant', 'light');
  header.setAttribute('sticky', '');
  expect(header.dataset.variant).toBe('light');
  expect(header.dataset.sticky).toBe('true');
  header.remove();
  document.body.append(header);
  expect(header.querySelectorAll('.sp-site-header-inner')).toHaveLength(1);
  expect(input?.value).toBe('Edited');
  header.removeAttribute('sticky');
  header.setAttribute('variant', 'invalid');
  expect(header.dataset.sticky).toBeUndefined();
  expect(header.dataset.variant).toBe('dark');
});

it('supports multiple navigation nodes and retains explicitly supplied landmark roles', () => {
  if (!SiteHeaderElement || !SiteFooterElement)
    throw new Error('Browser constructor missing');
  const header = new SiteHeaderElement();
  header.setAttribute('role', 'region');
  header.innerHTML =
    '<a data-slot="nav" href="#one">One</a><a data-slot="nav" href="#two">Two</a>';
  const footer = new SiteFooterElement();
  footer.setAttribute('role', 'region');
  document.body.append(header, footer);
  expect(header.getAttribute('role')).toBe('region');
  expect(header.querySelector('nav')?.children).toHaveLength(2);
  expect(footer.getAttribute('role')).toBe('region');
  expect(footer.querySelector('.sp-site-footer-grid')).toBeNull();
});

it('preserves footer slots, extras and bottom placement on variant changes and reconnect', () => {
  if (!SiteFooterElement) throw new Error('Browser constructor missing');
  const footer = new SiteFooterElement();
  footer.innerHTML =
    '<div data-slot="brand">Brand</div><div data-slot="links"><a href="#product">Product</a></div>Text<p>Extra</p><div data-slot="bottom">Copyright</div>';
  const link = footer.querySelector('a');
  document.body.append(footer);
  expect(customElements.get('sapphire-site-footer')).toBe(SiteFooterElement);
  expect(footer.getAttribute('role')).toBe('contentinfo');
  expect(
    footer.querySelector('.sp-site-footer-inner')?.lastElementChild?.className,
  ).toBe('sp-site-footer-bottom');
  expect(footer.textContent).toContain('Text');
  footer.setAttribute('variant', 'light');
  expect(footer.dataset.variant).toBe('light');
  footer.remove();
  document.body.append(footer);
  expect(footer.querySelector('a')).toBe(link);
  expect(footer.querySelectorAll('.sp-site-footer-inner')).toHaveLength(1);
  footer.setAttribute('variant', 'invalid');
  expect(footer.dataset.variant).toBe('dark');
});

it('matches React structural classes and host data attributes from equivalent slots', () => {
  if (!SiteHeaderElement || !SiteFooterElement)
    throw new Error('Browser constructor missing');
  const header = new SiteHeaderElement();
  header.setAttribute('sticky', '');
  header.setAttribute('variant', 'light');
  header.innerHTML =
    '<span data-slot="brand">Brand</span><a data-slot="nav" href="#nav">Nav</a><button data-slot="actions">Action</button>Extra';
  const footer = new SiteFooterElement();
  footer.setAttribute('variant', 'light');
  footer.innerHTML =
    '<span data-slot="brand">Brand</span><a data-slot="links" href="#links">Links</a><span data-slot="bottom">Bottom</span>Extra';
  document.body.append(header, footer);
  const headerTwin = render(
    <SiteHeader
      variant="light"
      sticky
      brand={<span>Brand</span>}
      nav={<a href="#nav">Nav</a>}
      actions={<button type="button">Action</button>}
    >
      Extra
    </SiteHeader>,
  );
  const footerTwin = render(
    <SiteFooter
      variant="light"
      brand={<span>Brand</span>}
      links={<a href="#links">Links</a>}
      bottom={<span>Bottom</span>}
    >
      Extra
    </SiteFooter>,
  );
  for (const [element, twin] of [
    [header, headerTwin.container.firstElementChild],
    [footer, footerTwin.container.firstElementChild],
  ]) {
    if (!element || !twin) throw new Error('Missing twin');
    expect(element.className).toBe(twin.className);
    expect(element.getAttribute('data-slot')).toBe(
      twin.getAttribute('data-slot'),
    );
    expect(element.getAttribute('data-variant')).toBe(
      twin.getAttribute('data-variant'),
    );
    const classes = (node: Element) =>
      Array.from(node.querySelectorAll('[class]'), (child) => child.className);
    expect(classes(element)).toEqual(classes(twin));
  }
});
