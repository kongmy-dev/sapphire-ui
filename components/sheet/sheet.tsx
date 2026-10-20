'use client';

import { Dialog as Primitive } from 'radix-ui';
import type { ComponentProps } from 'react';

export const Sheet = Primitive.Root;
export const SheetTrigger = Primitive.Trigger;
export const SheetClose = Primitive.Close;
export const SheetPortal = Primitive.Portal;

export function SheetOverlay({
  className,
  ...props
}: ComponentProps<typeof Primitive.Overlay>) {
  return (
    <Primitive.Overlay
      {...props}
      className={['sp-sheet-overlay', className].filter(Boolean).join(' ')}
      data-slot="sheet-overlay"
    />
  );
}

const sides = ['top', 'right', 'bottom', 'left'] as const;

export type SheetContentProps = ComponentProps<typeof Primitive.Content> & {
  side?: (typeof sides)[number] | null | undefined;
  hideClose?: boolean | undefined;
  closeLabel?: string | undefined;
};

export function SheetContent({
  className,
  children,
  side = 'right',
  hideClose = false,
  closeLabel = 'Close',
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <Primitive.Content
        {...props}
        className={['sp-sheet', className].filter(Boolean).join(' ')}
        data-side={side ?? undefined}
        data-slot="sheet"
      >
        {children}
        {!hideClose && (
          <Primitive.Close
            type="button"
            className="sp-sheet-close"
            data-slot="sheet-close"
            aria-label={closeLabel}
          >
            <svg
              className="sp-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </Primitive.Close>
        )}
      </Primitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-sheet-header', className].filter(Boolean).join(' ')}
      data-slot="sheet-header"
    />
  );
}

export function SheetTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={['sp-sheet-title', className].filter(Boolean).join(' ')}
      data-slot="sheet-title"
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={['sp-sheet-description', className].filter(Boolean).join(' ')}
      data-slot="sheet-description"
    />
  );
}

export function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-sheet-footer', className].filter(Boolean).join(' ')}
      data-slot="sheet-footer"
    />
  );
}
