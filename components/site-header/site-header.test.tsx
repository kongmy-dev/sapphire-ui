import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './site-header.examples.js';
import { SiteHeader, SiteHeaderLink } from './site-header.js';

test('preserves independent link variants native refs slots and active semantics', () => {
  const ref = createRef<HTMLElement>();
  const link = createRef<HTMLAnchorElement>();
  const view = render(
    <SiteHeader
      ref={ref}
      variant="light"
      sticky={false}
      className="custom"
      brand="Brand"
      nav={
        <SiteHeaderLink ref={link} href="#dark" variant="dark" active>
          Dark override
        </SiteHeaderLink>
      }
      actions={<button type="button">Action</button>}
    >
      <form aria-label="Search">
        <input aria-label="Query" />
      </form>
    </SiteHeader>,
  );
  expect(ref.current?.className).toBe('sp-site-header custom');
  expect(ref.current?.hasAttribute('data-sticky')).toBe(false);
  expect(link.current?.getAttribute('data-variant')).toBe('dark');
  expect(link.current?.getAttribute('aria-current')).toBe('page');
  expect(screen.getByRole('form')).not.toBeNull();
  view.rerender(
    <SiteHeader variant="dark">
      <SiteHeaderLink variant="light" href="#light" aria-current="step">
        Light override
      </SiteHeaderLink>
    </SiteHeader>,
  );
  expect(screen.getByRole('link').getAttribute('data-variant')).toBe('light');
  expect(screen.getByRole('link').getAttribute('aria-current')).toBe('step');
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
  });
}
