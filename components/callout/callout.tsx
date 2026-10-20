import type { ComponentProps, ReactElement, ReactNode } from 'react';

const variants = ['default', 'subtle'] as const;

export type CalloutProps = Omit<ComponentProps<'div'>, 'title'> & {
  variant?: (typeof variants)[number] | null | undefined;
  title?: ReactNode;
  icon?: ReactElement | null | undefined;
};

export function Callout({
  className,
  variant = 'default',
  title,
  icon,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      {...props}
      className={['sp-callout', className].filter(Boolean).join(' ')}
      data-slot="callout"
      data-variant={variant ?? undefined}
    >
      {icon && (
        <div className="sp-callout-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="sp-callout-content">
        {title && <div className="sp-callout-title">{title}</div>}
        <div className="sp-callout-body">{children}</div>
      </div>
    </div>
  );
}
