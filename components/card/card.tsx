import type { ComponentProps } from 'react';

const variants = ['default', 'dark', 'feature', 'dashed'] as const;
const paddings = ['default', 'compact', 'none'] as const;

export type CardProps = ComponentProps<'div'> & {
  variant?: (typeof variants)[number] | null | undefined;
  padding?: (typeof paddings)[number] | null | undefined;
  hoverable?: boolean | undefined;
  bordered?: boolean | undefined;
};

export function Card({
  className,
  variant = 'default',
  padding = 'default',
  hoverable,
  bordered,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={['sp-card', className].filter(Boolean).join(' ')}
      data-slot="card"
      data-variant={variant ?? undefined}
      data-padding={padding ?? undefined}
      data-hoverable={hoverable || undefined}
      data-bordered={bordered || undefined}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-card-header', className].filter(Boolean).join(' ')}
      data-slot="card-header"
    />
  );
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-card-body', className].filter(Boolean).join(' ')}
      data-slot="card-body"
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      {...props}
      className={['sp-card-footer', className].filter(Boolean).join(' ')}
      data-slot="card-footer"
    />
  );
}
