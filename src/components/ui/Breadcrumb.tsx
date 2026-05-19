import { forwardRef, Fragment, type HTMLAttributes, type ReactNode, type MouseEvent } from 'react';
import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Omit on the current page (renders as plain text with aria-current). */
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  /** Separator between items. Defaults to a chevron-right glyph. */
  separator?: ReactNode;
  /** Router-agnostic click interceptor. Same shape as MobileNav.onNavigate. */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Breadcrumb trail. Renders a single <nav aria-label="Breadcrumb"> with an
 * ordered list inside. The last item is treated as the current page —
 * rendered as plain text, marked `aria-current="page"`.
 */
const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, items, separator = '/', onNavigate, ...props }, ref) => (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('font-sans text-sm text-[var(--color-text-muted)]', className)}
      {...props}
    >
      <ol className="flex flex-wrap items-center gap-1.5 list-none m-0 p-0">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className="inline-flex items-center">
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className={isLast ? 'text-[var(--color-text-main)] font-medium' : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <a
                    href={item.href}
                    onClick={onNavigate ? (e) => onNavigate(item.href!, e) : undefined}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] transition-colors no-underline"
                  >
                    {item.label}
                  </a>
                )}
              </li>
              {!isLast && (
                <li aria-hidden="true" className="inline-flex items-center text-[var(--color-text-muted)] select-none">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  ),
);
Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb };
