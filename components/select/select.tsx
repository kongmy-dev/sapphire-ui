'use client';

import { Select as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { isolateSelect } from './select-isolation.js';

export const Select = Primitive.Root;
export const SelectGroup = Primitive.Group;

const sizes = ['sm', 'default', 'lg'] as const;

export type SelectTriggerProps = ComponentProps<typeof Primitive.Trigger> & {
  size?: (typeof sizes)[number] | null | undefined;
};

export function SelectValue({
  className,
  ref,
  style,
  ...props
}: ComponentProps<typeof Primitive.Value>) {
  return (
    <span
      ref={ref}
      style={style}
      className={['sp-select-value', className].filter(Boolean).join(' ')}
      data-slot="select-value"
    >
      <Primitive.Value {...props} />
    </span>
  );
}

export function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectTriggerProps) {
  return (
    <Primitive.Trigger
      {...props}
      className={['sp-select-trigger', className].filter(Boolean).join(' ')}
      data-slot="select-trigger"
      data-size={size ?? undefined}
    >
      {children}
      <Primitive.Icon asChild>
        <svg className="sp-select-icon" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </Primitive.Icon>
    </Primitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = 'popper',
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        position={position}
        className={['sp-select-content', className].filter(Boolean).join(' ')}
        data-slot="select-content"
      >
        <Primitive.Viewport
          ref={isolateSelect}
          className="sp-select-viewport"
          data-slot="select-viewport"
        >
          {children}
        </Primitive.Viewport>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function SelectLabel({
  className,
  ...props
}: ComponentProps<typeof Primitive.Label>) {
  return (
    <Primitive.Label
      {...props}
      className={['sp-select-label', className].filter(Boolean).join(' ')}
      data-slot="select-label"
    />
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.Item>) {
  return (
    <Primitive.Item
      {...props}
      className={['sp-select-item', className].filter(Boolean).join(' ')}
      data-slot="select-item"
    >
      <span className="sp-select-item-indicator">
        <Primitive.ItemIndicator>
          <svg
            className="sp-select-check"
            width="12"
            height="12"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path
              d="M2 6l3 3 5-6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </Primitive.ItemIndicator>
      </span>
      <Primitive.ItemText>{children}</Primitive.ItemText>
    </Primitive.Item>
  );
}

export function SelectSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      {...props}
      className={['sp-select-separator', className].filter(Boolean).join(' ')}
      data-slot="select-separator"
    />
  );
}
