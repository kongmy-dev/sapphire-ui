import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-sans font-semibold transition-all cursor-pointer no-underline select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary)] text-white rounded-[var(--radius-btn)] hover:bg-[#1a3358] border-none',
        outline:
          'bg-transparent text-[var(--color-primary)] rounded-[var(--radius-btn)] border-[1.5px] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-text-on-dark)]',
        ghost:
          'bg-transparent text-[var(--color-accent)] rounded-[var(--radius-btn)] border-[1.5px] border-[var(--color-accent)] hover:bg-[var(--color-hover-overlay)]',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-primary)] rounded-[var(--radius-btn)] border-none hover:bg-[var(--color-accent-dark)]',
        'on-dark-primary':
          'bg-[var(--color-accent)] text-[var(--color-primary)] rounded-[var(--radius-btn)] border-none hover:bg-[var(--color-accent-dark)] font-bold',
        'on-dark-outline':
          'bg-transparent text-[var(--color-text-on-dark)] rounded-[var(--radius-btn)] border-[1.5px] border-[rgba(255,255,255,0.3)] hover:border-white hover:text-white',
        link:
          'bg-transparent text-[var(--color-accent)] hover:text-[var(--color-accent-dark)] p-0 underline-offset-4 hover:underline border-none',
        premium:
          'bg-gradient-to-br from-[var(--color-accent)] to-[#b8904f] text-white rounded-[var(--radius-btn)] border-none shadow-[0_4px_14px_rgba(197,160,101,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(197,160,101,0.4)]',
      },
      size: {
        sm: 'text-sm px-4 py-2',
        default: 'text-base px-6 py-3',
        lg: 'text-lg px-8 py-4',
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
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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
