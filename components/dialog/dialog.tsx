'use client';

import { Dialog as Primitive } from 'radix-ui';
import { type ComponentProps, type ReactNode, useRef } from 'react';

export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export const DialogPortal = Primitive.Portal;

export function DialogOverlay({
  className,
  ...props
}: ComponentProps<typeof Primitive.Overlay>) {
  return (
    <Primitive.Overlay
      {...props}
      className={['sp-dialog-overlay', className].filter(Boolean).join(' ')}
      data-slot="dialog-overlay"
    />
  );
}

export type DialogContentProps = ComponentProps<typeof Primitive.Content> & {
  maxWidth?: string | undefined;
  hideClose?: boolean | undefined;
  closeLabel?: string | undefined;
};

export function DialogContent({
  className,
  children,
  maxWidth,
  hideClose = false,
  closeLabel = 'Close',
  style,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <Primitive.Content
        {...props}
        className={['sp-dialog', className].filter(Boolean).join(' ')}
        style={{ maxWidth, ...style }}
        data-slot="dialog"
      >
        {children}
        {!hideClose && (
          <Primitive.Close
            type="button"
            className="sp-dialog-close"
            data-slot="dialog-close"
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
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-dialog-header', className].filter(Boolean).join(' ')}
      data-slot="dialog-header"
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof Primitive.Title>) {
  return (
    <Primitive.Title
      {...props}
      className={['sp-dialog-title', className].filter(Boolean).join(' ')}
      data-slot="dialog-title"
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof Primitive.Description>) {
  return (
    <Primitive.Description
      {...props}
      className={['sp-dialog-description', className].filter(Boolean).join(' ')}
      data-slot="dialog-description"
    />
  );
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-dialog-body', className].filter(Boolean).join(' ')}
      data-slot="dialog-body"
    />
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-dialog-footer', className].filter(Boolean).join(' ')}
      data-slot="dialog-footer"
    />
  );
}

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string | undefined;
  cancelLabel?: string | undefined;
  onConfirm: () => void;
  onCancel?: (() => void) | undefined;
  isDanger?: boolean | undefined;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
  children,
}: ConfirmDialogProps) {
  const returnTarget = useRef<HTMLElement | null>(null);
  function rememberFocus() {
    const active = document.activeElement;
    returnTarget.current = active instanceof HTMLElement ? active : null;
  }
  function restoreFocus(event: Event) {
    if (!returnTarget.current?.isConnected) return;
    event.preventDefault();
    returnTarget.current.focus();
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        maxWidth="420px"
        onOpenAutoFocus={rememberFocus}
        onCloseAutoFocus={restoreFocus}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription className="sp-dialog-message">
            {message}
          </DialogDescription>
          {children}
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            className="sp-dialog-action"
            onClick={() => {
              onCancel?.();
              onOpenChange(false);
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="sp-dialog-action"
            data-variant={isDanger ? 'destructive' : 'primary'}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
