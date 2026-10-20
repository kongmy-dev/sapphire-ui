import { expect, it } from 'bun:test';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { examples } from './card.examples.js';
import { Card, CardBody, CardFooter, CardHeader } from './card.js';

it('preserves native attributes and refs on the root and each part', () => {
  const root = createRef<HTMLDivElement>();
  const header = createRef<HTMLDivElement>();
  const body = createRef<HTMLDivElement>();
  const footer = createRef<HTMLDivElement>();
  render(
    <Card ref={root} className="custom" role="region" aria-label="Project">
      <CardHeader ref={header} className="custom-header">
        Header
      </CardHeader>
      <CardBody ref={body} className="custom-body">
        Body
      </CardBody>
      <CardFooter ref={footer} className="custom-footer">
        Footer
      </CardFooter>
    </Card>,
  );
  expect(root.current).toBe(screen.getByRole('region'));
  expect(root.current?.className).toBe('sp-card custom');
  expect(header.current).toBe(screen.getByText('Header'));
  expect(body.current).toBe(screen.getByText('Body'));
  expect(footer.current).toBe(screen.getByText('Footer'));
  expect(header.current?.className).toBe('sp-card-header custom-header');
  expect(body.current?.className).toBe('sp-card-body custom-body');
  expect(footer.current?.className).toBe('sp-card-footer custom-footer');
});

it('keeps modifiers independent and accepts null or explicit undefined variants', () => {
  const { rerender } = render(
    <Card variant="dark" padding="compact" hoverable bordered role="region" />,
  );
  const card = screen.getByRole('region');
  expect(card.dataset.variant).toBe('dark');
  expect(card.dataset.padding).toBe('compact');
  expect(card.hasAttribute('data-hoverable')).toBe(true);
  expect(card.hasAttribute('data-bordered')).toBe(true);
  rerender(
    <Card
      variant={null}
      padding={null}
      hoverable={false}
      bordered={false}
      role="region"
    />,
  );
  expect(card.hasAttribute('data-variant')).toBe(false);
  expect(card.hasAttribute('data-padding')).toBe(false);
  expect(card.hasAttribute('data-hoverable')).toBe(false);
  expect(card.hasAttribute('data-bordered')).toBe(false);
  rerender(<Card variant={undefined} padding={undefined} role="region" />);
  expect(card.dataset.variant).toBe('default');
  expect(card.dataset.padding).toBe('default');
});

for (const { name, render: Example } of examples) {
  it(`renders the ${name} example`, () => {
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-card')).not.toBeNull();
  });
}
