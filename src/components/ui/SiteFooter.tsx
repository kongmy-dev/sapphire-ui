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
  ({ className, brand, links, bottom, variant = 'dark', children, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'w-full border-t',
        variant === 'dark'
          ? 'bg-[var(--color-primary)] text-[var(--color-text-on-dark)] border-[var(--color-border-dark)]'
          // Light variant: hardcoded light palette so it stays light even
          // when the surrounding page is in dark theme.
          : 'bg-white text-[#1e293b] border-[#e2e8f0]',
        className,
      )}
      {...props}
    >
      <div className="max-w-[80rem] mx-auto px-6 py-12 md:py-16">
        {/* Main row: brand + links */}
        {(brand || links) && (
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-10">
            {brand && <div className="md:max-w-xs shrink-0">{brand}</div>}
            {links && <div className="flex flex-wrap gap-10 md:gap-16 flex-1">{links}</div>}
          </div>
        )}
        {children}
        {/* Bottom bar */}
        {bottom && (
          <div className={cn(
            'pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[11px] uppercase tracking-[0.06em]',
            variant === 'dark'
              ? 'border-[var(--color-border-dark)] text-[var(--color-text-on-dark-muted)]'
              : 'border-[#e2e8f0] text-[#475569]',
          )}>
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
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-accent)]">
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
          ? 'text-[var(--color-text-on-dark-muted)] hover:text-white'
          : 'text-[#475569] hover:text-[#0a192f]',
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
