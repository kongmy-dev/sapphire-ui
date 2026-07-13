import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/* ─── SiteFooter ────────────────────────────────────────────────────── */

export interface SiteFooterProps extends HTMLAttributes<HTMLElement> {
  /** Brand section (left) — typically brand name + tagline */
  brand?: ReactNode;
  /** Link groups (center) */
  links?: ReactNode;
  /** Bottom row — copyright, legal links */
  bottom?: ReactNode;
  /** Dark (navy) variant */
  variant?: 'light' | 'dark';
}

const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(
  (
    { className, brand, links, bottom, variant = 'dark', children, ...props },
    ref,
  ) => (
    <footer
      ref={ref}
      className={cn(
        'w-full border-t',
        variant === 'dark'
          ? 'border-border-dark bg-primary text-text-on-dark'
          : // Light variant: hardcoded light palette so it stays light even
            // when the surrounding page is in dark theme.
            'border-border bg-(--color-card-bg) text-text-main',
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Main row: brand + links */}
        {(brand || links) && (
          <div className="mb-10 flex flex-col gap-10 md:flex-row md:gap-16">
            {brand && <div className="shrink-0 md:max-w-xs">{brand}</div>}
            {links && (
              <div className="flex flex-1 flex-wrap gap-10 md:gap-16">
                {links}
              </div>
            )}
          </div>
        )}
        {children}
        {/* Bottom bar */}
        {bottom && (
          <div
            className={cn(
              'flex flex-col items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.06em] md:flex-row',
              (brand || links || children) && 'border-t pt-6',
              variant === 'dark'
                ? 'border-border-dark text-text-on-dark-muted'
                : 'border-border text-text-muted',
            )}
          >
            {bottom}
          </div>
        )}
      </div>
    </footer>
  ),
);
SiteFooter.displayName = 'SiteFooter';

/* ─── SiteFooterGroup ───────────────────────────────────────────────── */

export interface SiteFooterGroupProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

const SiteFooterGroup = forwardRef<HTMLDivElement, SiteFooterGroupProps>(
  ({ className, title, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col gap-3', className)} {...props}>
      <span className="font-bold font-mono text-accent text-xs uppercase tracking-widest">
        {title}
      </span>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  ),
);
SiteFooterGroup.displayName = 'SiteFooterGroup';

/* ─── SiteFooterLink ────────────────────────────────────────────────── */

export interface SiteFooterLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'light' | 'dark';
}

const SiteFooterLink = forwardRef<HTMLAnchorElement, SiteFooterLinkProps>(
  ({ className, variant = 'dark', children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        'font-sans text-sm no-underline transition-colors',
        variant === 'dark'
          ? 'text-text-on-dark-muted hover:text-text-on-dark'
          : 'text-text-muted hover:text-(--color-text-strong)',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
);
SiteFooterLink.displayName = 'SiteFooterLink';

export { SiteFooter, SiteFooterGroup, SiteFooterLink };
