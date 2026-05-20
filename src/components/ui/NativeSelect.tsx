import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NativeSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  /** Visual variant */
  variant?: 'default' | 'dark';
}

const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, variant = 'dark', children, disabled, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            variant === 'dark' && 'k-input-dark',
            variant === 'default' &&
              'w-full font-sans text-base bg-[var(--color-card-bg)] text-[var(--color-text-main)] border border-[var(--color-border)] rounded-[var(--radius-btn)] px-4 py-3 outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_rgba(197,160,101,0.12)] appearance-none cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
            'pr-10',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span
          className={cn(
            'material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]',
            variant === 'dark' ? 'text-[var(--color-text-on-dark-muted)]' : 'text-[var(--color-text-muted)]',
          )}
        >
          expand_more
        </span>
      </div>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';

export { NativeSelect };
