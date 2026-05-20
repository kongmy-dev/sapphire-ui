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
      'fixed inset-0 z-[1000] bg-[rgba(10,25,47,0.85)] backdrop-blur-[4px]',
      'data-[state=open]:animate-[fadeIn_200ms_ease] data-[state=closed]:animate-[fadeOut_150ms_ease]',
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
        'fixed left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2',
        'w-[90%] max-h-[85vh] flex flex-col',
        'bg-white rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]',
        'data-[state=open]:animate-[dialogIn_200ms_ease] data-[state=closed]:animate-[dialogOut_150ms_ease]',
        'outline-none',
        className,
      )}
      style={{ maxWidth }}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors cursor-pointer border-none bg-transparent outline-none">
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
        'px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between',
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
    className={cn('font-serif text-lg font-semibold text-[var(--color-primary)] m-0', className)}
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
    className={cn('font-sans text-sm text-[var(--color-text-muted)] mt-1', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

/* ─── Body ──────────────────────────────────────────────────────────── */

const DialogBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-5 overflow-y-auto flex-1', className)}
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
        'px-6 py-4 border-t border-[var(--color-border)] flex justify-end gap-3',
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
          <p className="font-sans text-sm text-[var(--color-text-muted)] leading-relaxed m-0">
            {message}
          </p>
        </DialogBody>
        <DialogFooter>
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 text-sm font-medium rounded-[var(--radius-btn)] cursor-pointer font-sans text-[var(--color-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors outline-none"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => { onConfirm(); onOpenChange(false); }}
            className="px-5 py-2.5 text-sm font-medium rounded-[var(--radius-btn)] cursor-pointer font-sans text-white border-none transition-colors outline-none"
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
