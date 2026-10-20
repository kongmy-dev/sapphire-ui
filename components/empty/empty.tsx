import type { ComponentProps, ReactElement, ReactNode } from 'react';

export type EmptyProps = ComponentProps<'div'> & {
  icon?: ReactElement | undefined;
  title?: string | undefined;
  description?: string | undefined;
  action?: ReactNode;
};

export function Empty({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyProps) {
  return (
    <div
      {...props}
      className={['sp-empty', className].filter(Boolean).join(' ')}
      data-slot="empty"
    >
      {icon && (
        <span className="sp-empty-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {title && <h3 className="sp-empty-title">{title}</h3>}
      {description && <p className="sp-empty-description">{description}</p>}
      {action && <div className="sp-empty-action">{action}</div>}
    </div>
  );
}
