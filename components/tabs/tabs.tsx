'use client';

import { Tabs as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

const variants = ['underline', 'pills', 'dashboard'] as const;

type TabsListProps = ComponentProps<typeof Primitive.List> & {
  variant?: (typeof variants)[number] | undefined;
};

export function Tabs({
  className,
  ...props
}: ComponentProps<typeof Primitive.Root>) {
  return (
    <Primitive.Root
      {...props}
      className={['sp-tabs', className].filter(Boolean).join(' ')}
      data-slot="tabs"
    />
  );
}

export function TabsList({
  className,
  variant = 'underline',
  ...props
}: TabsListProps) {
  return (
    <Primitive.List
      {...props}
      className={['sp-tabs-list', className].filter(Boolean).join(' ')}
      data-slot="tabs-list"
      data-variant={variant}
    />
  );
}

export function TabsTrigger({
  className,
  ...props
}: ComponentProps<typeof Primitive.Trigger>) {
  return (
    <Primitive.Trigger
      {...props}
      className={['sp-tabs-trigger', className].filter(Boolean).join(' ')}
      data-slot="tabs-trigger"
    />
  );
}

export function TabsContent({
  className,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Content
      {...props}
      className={['sp-tabs-content', className].filter(Boolean).join(' ')}
      data-slot="tabs-content"
    />
  );
}
