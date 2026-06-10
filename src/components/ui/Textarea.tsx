import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const textareaVariants = cva(
  'resize-vertical w-full font-sans transition-all duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-error aria-invalid:focus:shadow-error/12',
  {
    variants: {
      variant: {
        default:
          'rounded-btn border border-border bg-(--color-card-bg) text-text-main focus:border-accent focus:shadow-[0_0_0_3px] focus:shadow-accent/12',
        dark:
          'rounded-sm border border-border-dark bg-black/20 text-text-on-dark focus:border-accent',
        mono:
          'rounded-btn border border-border bg-surface font-mono text-sm text-text-main focus:border-accent focus:shadow-[0_0_0_3px] focus:shadow-accent/12',
      },
      size: {
        sm: 'min-h-[80px] px-3 py-2 text-sm',
        default: 'min-h-[120px] px-4 py-3 text-base',
        lg: 'min-h-[160px] px-5 py-4 text-lg',
      },
    },
    compoundVariants: [
      // dark variant historically used tighter padding — preserved at default size
      { variant: 'dark', size: 'default', className: 'px-3 py-2.5' },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
