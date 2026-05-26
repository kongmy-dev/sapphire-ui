import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 font-sans font-semibold no-underline transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-(--color-focus-ring) focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'rounded-btn border-none bg-primary text-(--color-text-on-dark) hover:bg-(--color-primary-hover)',
        outline:
          'rounded-btn border-[1.5px] border-(--color-text-strong) bg-transparent text-(--color-text-strong) hover:bg-(--color-text-strong) hover:text-(--color-card-bg)',
        ghost:
          'rounded-btn border-[1.5px] border-accent bg-transparent text-(--color-accent-text) hover:bg-[var(--color-hover-overlay)]',
        accent:
          'rounded-btn border-none bg-accent text-primary hover:bg-accent-dark',
        'on-dark-primary':
          'rounded-btn border-none bg-accent font-bold text-primary hover:bg-accent-dark',
        'on-dark-outline':
          'rounded-btn border-[1.5px] border-white/30 bg-transparent text-(--color-text-on-dark) hover:border-white hover:text-(--color-text-on-dark)',
        link:
          'border-none bg-transparent p-0 text-(--color-accent-text) underline-offset-4 hover:text-(--color-text-strong) hover:underline',
        premium:
          'rounded-btn border-none bg-linear-to-br from-accent to-accent-dark text-(--color-text-on-dark) shadow-[0_4px_14px] shadow-accent/30 hover:-translate-y-0.5 hover:shadow-[0_6px_20px] hover:shadow-accent/40',
        destructive:
          'rounded-btn border-none bg-(--color-error) text-(--color-text-on-dark) hover:bg-(--color-error-hover) focus-visible:ring-(--color-error-ring)',
        'destructive-outline':
          'rounded-btn border-[1.5px] border-(--color-error) bg-transparent text-(--color-error) hover:bg-(--color-error) hover:text-(--color-text-on-dark) focus-visible:ring-(--color-error-ring)',
      },
      size: {
        sm: 'px-4 py-2 text-sm',
        default: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        icon: 'p-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as child element (e.g. <a>, router Link) */
  asChild?: boolean;
  /** Material Symbols icon name to prepend */
  icon?: string;
  /** Show loading spinner */
  loading?: boolean;
  children?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, icon, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading && (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {icon && !loading && (
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
            )}
            {children}
          </>
        )}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
