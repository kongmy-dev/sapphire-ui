import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './site-footer.examples.js';
import { SiteFooter, SiteFooterGroup, SiteFooterLink } from './site-footer.js';

test('preserves footer slots native refs independent link variants and arbitrary children', () => {
  const ref = createRef<HTMLElement>();
  const group = createRef<HTMLDivElement>();
  const link = createRef<HTMLAnchorElement>();
  const view = render(
    <SiteFooter
      ref={ref}
      variant="light"
      className="custom"
      brand="Brand"
      links={
        <SiteFooterGroup ref={group} title="Resources">
          <SiteFooterLink ref={link} variant="dark" href="#dark">
            Dark override
          </SiteFooterLink>
        </SiteFooterGroup>
      }
      bottom="Copyright"
    >
      <form aria-label="Subscribe">
        <input aria-label="Email" />
      </form>
    </SiteFooter>,
  );
  expect(ref.current?.className).toBe('sp-site-footer custom');
  expect(group.current?.className).toBe('sp-site-footer-group');
  expect(link.current?.getAttribute('data-variant')).toBe('dark');
  expect(screen.getByRole('form')).not.toBeNull();
  view.rerender(
    <SiteFooter variant="dark">
      <SiteFooterLink variant="light" href="#light">
        Light override
      </SiteFooterLink>
    </SiteFooter>,
  );
  expect(screen.getByRole('link').getAttribute('data-variant')).toBe('light');
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
  });
}
