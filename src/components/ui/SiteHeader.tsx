import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

/* ─── SiteHeader ────────────────────────────────────────────────────── */

export interface SiteHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Brand name displayed on left */
  brand?: ReactNode;
  /** Navigation items (center or after brand) */
  nav?: ReactNode;
  /** Actions / CTA buttons on right */
  actions?: ReactNode;
  /** Sticky header */
  sticky?: boolean;
  /** Dark (navy) variant */
  variant?: 'light' | 'dark';
}

const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(
  ({ className, brand, nav, actions, sticky = true, variant = 'dark', children, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        'z-40 w-full border-b',
        sticky && 'sticky top-0',
        variant === 'dark'
          ? 'border-border-dark bg-primary text-white'
          // Light variant: hardcoded light palette so it stays light even
          // when previewed inside a dark-themed page (e.g. /interactive
          // demos a light header on a dark docs background).
          : 'border-border bg-white text-primary',
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        {brand && <div className="flex shrink-0 items-center gap-3">{brand}</div>}
        {nav && <nav className="hidden flex-1 items-center gap-1 md:flex">{nav}</nav>}
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
        {children}
      </div>
    </header>
  ),
);
SiteHeader.displayName = 'SiteHeader';

/* ─── SiteHeaderLink ────────────────────────────────────────────────── */

export interface SiteHeaderLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string;
  active?: boolean;
  variant?: 'light' | 'dark';
}

const SiteHeaderLink = forwardRef<HTMLAnchorElement, SiteHeaderLinkProps>(
  ({ className, active = false, variant = 'dark', children, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        'rounded-btn px-3 py-2 font-sans text-sm font-medium no-underline transition-colors',
        variant === 'dark'
          ? active
            ? 'bg-[rgba(197,160,101,0.1)] text-accent'
            : 'text-(--color-text-on-dark-muted) hover:bg-[rgba(255,255,255,0.06)] hover:text-white'
          // Light variant: hardcoded so the link stays readable on the
          // light header background regardless of the surrounding theme.
          : active
            ? 'bg-surface text-primary'
            : 'text-[#475569] hover:bg-surface hover:text-primary',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  ),
);
SiteHeaderLink.displayName = 'SiteHeaderLink';

export { SiteHeader, SiteHeaderLink };
