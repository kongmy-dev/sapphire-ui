'use client';

import { DropdownMenu as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
export const DropdownMenuGroup = Primitive.Group;
export const DropdownMenuPortal = Primitive.Portal;
export const DropdownMenuSub = Primitive.Sub;
export const DropdownMenuRadioGroup = Primitive.RadioGroup;

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof Primitive.Content>) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        className={['sp-dropdown-menu', className].filter(Boolean).join(' ')}
        data-slot="dropdown-menu"
        sideOffset={sideOffset}
      />
    </Primitive.Portal>
  );
}

const itemVariants = ['destructive'] as const;

export function DropdownMenuItem({
  className,
  inset,
  'data-variant': variant,
  ...props
}: ComponentProps<typeof Primitive.Item> & {
  inset?: boolean | undefined;
  'data-variant'?: (typeof itemVariants)[number] | undefined;
}) {
  return (
    <Primitive.Item
      {...props}
      className={['sp-dropdown-menu-item', className].filter(Boolean).join(' ')}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      data-inset={inset || undefined}
    />
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof Primitive.Label> & { inset?: boolean | undefined }) {
  return (
    <Primitive.Label
      {...props}
      className={['sp-dropdown-menu-label', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof Primitive.Separator>) {
  return (
    <Primitive.Separator
      {...props}
      className={['sp-dropdown-menu-separator', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="dropdown-menu-separator"
    />
  );
}

export function DropdownMenuShortcut({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      {...props}
      className={['sp-dropdown-menu-shortcut', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="dropdown-menu-shortcut"
    />
  );
}

export function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.CheckboxItem>) {
  return (
    <Primitive.CheckboxItem
      {...props}
      className={['sp-dropdown-menu-checkbox-item', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="dropdown-menu-checkbox-item"
    >
      <span className="sp-dropdown-menu-item-indicator">
        <Primitive.ItemIndicator>
          <svg
            className="sp-icon"
            width={12}
            height={12}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof Primitive.RadioItem>) {
  return (
    <Primitive.RadioItem
      {...props}
      className={['sp-dropdown-menu-radio-item', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="dropdown-menu-radio-item"
    >
      <span className="sp-dropdown-menu-item-indicator">
        <Primitive.ItemIndicator>
          <span className="sp-dropdown-menu-radio-dot" />
        </Primitive.ItemIndicator>
      </span>
      {children}
    </Primitive.RadioItem>
  );
}
