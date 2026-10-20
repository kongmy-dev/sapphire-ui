'use client';

import {
  type ComponentProps,
  Fragment,
  type MouseEvent,
  type ReactNode,
} from 'react';

export type BreadcrumbItem = {
  readonly label: ReactNode;
  readonly href?: string | undefined;
};
export type BreadcrumbProps = ComponentProps<'nav'> & {
  items: readonly BreadcrumbItem[];
  separator?: ReactNode;
  onNavigate?:
    | ((href: string, event: MouseEvent<HTMLAnchorElement>) => void)
    | undefined;
};

export function Breadcrumb({
  items,
  separator = '/',
  onNavigate,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      {...props}
      className={['sp-breadcrumb', className].filter(Boolean).join(' ')}
      data-slot="breadcrumb"
    >
      <ol className="sp-breadcrumb-list">
        {items.map(({ label, href }, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={index}>
              <li className="sp-breadcrumb-item">
                {isLast || !href ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'sp-breadcrumb-page' : undefined}
                  >
                    {label}
                  </span>
                ) : (
                  <a
                    href={href}
                    className="sp-breadcrumb-link"
                    onClick={(event) => onNavigate?.(href, event)}
                  >
                    {label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li className="sp-breadcrumb-separator" aria-hidden="true">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
