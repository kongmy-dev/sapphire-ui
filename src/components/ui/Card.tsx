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
          'rounded-md p-8 transition-all duration-200',
          variant === 'default' && 'border border-border bg-(--color-card-bg)',
          variant === 'dark' && 'border border-border-dark bg-primary text-(--color-text-on-dark)',
          variant === 'feature' && 'grid gap-8 border border-border bg-(--color-card-bg) md:grid-cols-[1fr_auto]',
          variant === 'dashed' && 'border-[1.5px] border-dashed border-border bg-transparent text-(--color-text-muted)',
          hoverable && variant === 'default' && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-(--shadow-card-hover)',
          hoverable && variant === 'dark' && 'cursor-pointer hover:border-accent',
          hoverable && variant === 'dashed' && 'cursor-pointer hover:border-accent hover:text-(--color-text-main)',
          bordered && 'border-l-[6px] border-l-accent',
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
        'mt-auto flex items-center justify-between border-t border-border pt-4',
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
