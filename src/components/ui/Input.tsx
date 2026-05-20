import { forwardRef, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'w-full font-sans text-base outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--color-card-bg)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-[var(--radius-btn)] px-4 py-3 focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)]',
        dark:
          'bg-[rgba(0,0,0,0.2)] text-[var(--color-text-on-dark)] border border-[var(--color-border-dark)] rounded-[var(--radius-sm)] px-3 py-2.5 focus:border-[var(--color-accent)]',
        mono:
          'bg-[var(--color-surface)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-[var(--radius-btn)] px-4 py-3 font-mono text-sm focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
