import * as DialogPrimitive from '@radix-ui/react-dialog';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';

/* ─── Root ──────────────────────────────────────────────────────────── */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

/* ─── Overlay ───────────────────────────────────────────────────────── */

const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-1000 bg-primary/85 backdrop-blur-xs',
      'data-[state=closed]:animate-[fadeOut_150ms_ease] data-[state=open]:animate-[fadeIn_200ms_ease]',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

/* ─── Content ───────────────────────────────────────────────────────── */

const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    /** Max width CSS value */
    maxWidth?: string;
    /** Hide the default close button */
    hideClose?: boolean;
  }
>(({ className, children, maxWidth = '800px', hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-1001 -translate-1/2',
        'flex max-h-[85vh] w-[90%] flex-col',
        'rounded-md bg-(--color-card-bg) shadow-(--shadow-lg)',
        'data-[state=closed]:animate-[dialogOut_150ms_ease] data-[state=open]:animate-[dialogIn_200ms_ease]',
        'outline-none',
        className,
      )}
      style={{ maxWidth }}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute top-4 right-4 cursor-pointer rounded-sm border-none bg-transparent p-1.5 text-(--color-text-muted) transition-colors outline-none hover:bg-surface hover:text-(--color-text-strong)">
          <Icon name="close" size={18} />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

/* ─── Header ────────────────────────────────────────────────────────── */

const DialogHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between border-b border-border px-6 py-4',
        className,
      )}
      {...props}
    />
  ),
);
DialogHeader.displayName = 'DialogHeader';

/* ─── Title ─────────────────────────────────────────────────────────── */

const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('m-0 font-serif text-lg font-semibold text-(--color-text-strong)', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

/* ─── Description ───────────────────────────────────────────────────── */

const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('mt-1 font-sans text-sm text-(--color-text-muted)', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

/* ─── Body ──────────────────────────────────────────────────────────── */

const DialogBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto px-6 py-5', className)}
      {...props}
    />
  ),
);
DialogBody.displayName = 'DialogBody';

/* ─── Footer ────────────────────────────────────────────────────────── */

const DialogFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex justify-end gap-3 border-t border-border px-6 py-4',
        className,
      )}
      {...props}
    />
  ),
);
DialogFooter.displayName = 'DialogFooter';

/* ─── ConfirmDialog (pre-composed) ──────────────────────────────────── */

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  /** Red confirm button */
  isDanger?: boolean;
  children?: ReactNode;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent maxWidth="420px">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="m-0 font-sans text-sm/relaxed text-(--color-text-muted)">
            {message}
          </p>
        </DialogBody>
        <DialogFooter>
          <button
            onClick={handleCancel}
            className="cursor-pointer rounded-btn border border-border bg-surface px-5 py-2.5 font-sans text-sm font-medium text-(--color-text-strong) transition-colors outline-none hover:bg-border"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className="cursor-pointer rounded-btn border-none px-5 py-2.5 font-sans text-sm font-medium text-white transition-colors outline-none"
            style={{ backgroundColor: isDanger ? 'var(--color-error)' : 'var(--color-primary)' }}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  ConfirmDialog,
};
