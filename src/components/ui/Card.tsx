import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/* ─── Card Root ─────────────────────────────────────────────────────── */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: 'default' | 'dark' | 'feature' | 'dashed';
  /** Enable hover lift effect */
  hoverable?: boolean;
  /** Show left accent border */
  bordered?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', hoverable = false, bordered = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-md)] p-8 transition-all duration-200',
          variant === 'default' && 'bg-white border border-[var(--color-border)]',
          variant === 'dark' && 'bg-[var(--color-primary)] border border-[var(--color-border-dark)] text-[var(--color-text-on-dark)]',
          variant === 'feature' && 'bg-white border border-[var(--color-border)] grid md:grid-cols-[1fr_auto] gap-8',
          variant === 'dashed' && 'bg-transparent border-[1.5px] border-dashed border-[var(--color-border)] text-[var(--color-text-muted)]',
          hoverable && variant === 'default' && 'hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 cursor-pointer',
          hoverable && variant === 'dark' && 'hover:border-[var(--color-accent)] cursor-pointer',
          hoverable && variant === 'dashed' && 'hover:border-[var(--color-accent)] hover:text-[var(--color-text-main)] cursor-pointer',
          bordered && 'border-l-[6px] border-l-[var(--color-accent)]',
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

/* ─── Card Header ──────────────────────────────────────────────────── */

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col items-start gap-3', className)}
      {...props}
    />
  ),
);
CardHeader.displayName = 'CardHeader';

/* ─── Card Body ────────────────────────────────────────────────────── */

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  ),
);
CardBody.displayName = 'CardBody';

/* ─── Card Footer ──────────────────────────────────────────────────── */

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-between pt-4 border-t border-[var(--color-border)] mt-auto',
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
