import { expect, test } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, createRef } from 'react';
import { examples } from './layout.examples.js';
import { Layout } from './layout.js';

test('preserves arbitrary slots forms refs and main classes', () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Layout
      ref={ref}
      className="custom"
      mainClassName="content"
      header={<header>Header</header>}
      sidebar={<aside>Rail</aside>}
      footer={<footer>Footer</footer>}
    >
      <form aria-label="Editor">
        <textarea aria-label="Document" />
      </form>
    </Layout>,
  );
  expect(ref.current?.className).toBe('sp-layout custom');
  expect(screen.getByRole('main').className).toBe('sp-layout-main content');
  expect(screen.getByRole('main').contains(screen.getByRole('form'))).toBe(
    true,
  );
  expect(screen.getByRole('banner')).not.toBeNull();
  expect(screen.getByRole('complementary')).not.toBeNull();
  expect(screen.getByRole('contentinfo')).not.toBeNull();
});

for (const example of examples) {
  test(`example ${example.name} renders its public content`, () => {
    const view = render(createElement(example.render));
    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector('[data-slot]')).not.toBeNull();
    if (example.name === 'settings') {
      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
      expect(screen.getByRole('status').textContent).toBe('Settings saved');
    }
  });
}
