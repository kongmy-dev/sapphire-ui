'use client';

import { Accordion as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export function Accordion({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-accordion', className].filter(Boolean).join(' ')}
      data-slot="accordion"
    />
  );
}

export function AccordionItem({
  className,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      {...props}
      className={['sp-accordion-item', className].filter(Boolean).join(' ')}
      data-slot="accordion-item"
    />
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Header className="sp-accordion-header">
      <Primitive.Trigger
        {...props}
        className={['sp-accordion-trigger', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="accordion-trigger"
      >
        {children}
        <svg
          aria-hidden="true"
          className="sp-accordion-chevron"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Primitive.Trigger>
    </Primitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      {...props}
      className="sp-accordion-content"
      data-slot="accordion-content"
    >
      <div
        className={['sp-accordion-body', className].filter(Boolean).join(' ')}
      >
        {children}
      </div>
    </Primitive.Content>
  );
}
