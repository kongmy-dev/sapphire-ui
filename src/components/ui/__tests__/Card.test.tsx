import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader, CardBody, CardFooter } from '../Card';
import React from 'react';

describe('Card', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
        <CardBody>Body</CardBody>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(container.firstChild).toBeInTheDocument();
    expect(container).toHaveTextContent('Header');
    expect(container).toHaveTextContent('Body');
    expect(container).toHaveTextContent('Footer');
  });

  it('applies variant classes', () => {
    const { container } = render(<Card variant="dark">Test</Card>);
    expect(container.firstChild).toHaveClass('bg-primary');
  });

  it('applies hoverable and bordered props', () => {
    const { container } = render(<Card hoverable bordered>Test</Card>);
    // 'default' variant hover class
    expect(container.firstChild).toHaveClass('hover:-translate-y-0.5');
    // bordered class
    expect(container.firstChild).toHaveClass('border-l-[6px]');
  });

  it('forwards refs to root and subcomponents', () => {
    const rootRef = React.createRef<HTMLDivElement>();
    const headerRef = React.createRef<HTMLDivElement>();
    const bodyRef = React.createRef<HTMLDivElement>();
    const footerRef = React.createRef<HTMLDivElement>();

    render(
      <Card ref={rootRef}>
        <CardHeader ref={headerRef}>Header</CardHeader>
        <CardBody ref={bodyRef}>Body</CardBody>
        <CardFooter ref={footerRef}>Footer</CardFooter>
      </Card>
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(bodyRef.current).toBeInstanceOf(HTMLDivElement);
    expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
  });
});
