import { expect, test } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './page-section.examples.js';
import { PageSection } from './page-section.js';

test('renders optional heading fields and preserves native content refs and styles', () => {
  const ref = createRef<HTMLElement>();
  const view = render(
    <PageSection
      ref={ref}
      label="Approach"
      heading="Clarity"
      subheading="Accessible composition"
      className="custom"
      maxWidth="md"
      style={{ maxWidth: '50%' }}
    >
      <form aria-label="Contact">
        <input aria-label="Name" />
      </form>
    </PageSection>,
  );
  expect(ref.current?.className).toBe('sp-page-section custom');
  expect(ref.current?.style.maxWidth).toBe('50%');
  expect(ref.current?.getAttribute('data-size')).toBe('md');
  expect(screen.getByRole('heading', { name: 'Clarity' })).not.toBeNull();
  expect(screen.getByText('Approach')).not.toBeNull();
  expect(screen.getByRole('form')).not.toBeNull();
  view.rerender(<PageSection>Content only</PageSection>);
  expect(screen.queryByRole('heading')).toBeNull();
  expect(screen.getByText('Content only')).not.toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
  });
}
