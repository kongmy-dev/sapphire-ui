import type { ComponentProps, ReactNode } from 'react';

export type PageHeaderProps = Omit<ComponentProps<'header'>, 'title'> & {
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  className,
  title,
  description,
  breadcrumbs,
  actions,
  children,
  ...props
}: PageHeaderProps) {
  return (
    <header
      {...props}
      className={['sp-page-header', className].filter(Boolean).join(' ')}
      data-slot="page-header"
    >
      {breadcrumbs && (
        <div className="sp-page-header-breadcrumbs">{breadcrumbs}</div>
      )}
      <div className="sp-page-header-body">
        <div className="sp-page-header-heading">
          <h1>{title}</h1>
          {description && (
            <p className="sp-page-header-description">{description}</p>
          )}
        </div>
        {actions && <div className="sp-page-header-actions">{actions}</div>}
      </div>
      {children}
    </header>
  );
}
