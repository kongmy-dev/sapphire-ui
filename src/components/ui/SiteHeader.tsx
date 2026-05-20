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
        'w-full z-40 border-b',
        sticky && 'sticky top-0',
        variant === 'dark'
          ? 'bg-[var(--color-primary)] text-white border-[var(--color-border-dark)]'
          // Light variant: hardcoded light palette so it stays light even
          // when previewed inside a dark-themed page (e.g. /interactive
          // demos a light header on a dark docs background).
          : 'bg-white text-[#0a192f] border-[#e2e8f0]',
        className,
      )}
      {...props}
    >
      <div className="max-w-[80rem] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {brand && <div className="flex items-center gap-3 shrink-0">{brand}</div>}
        {nav && <nav className="hidden md:flex items-center gap-1 flex-1">{nav}</nav>}
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
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
        'font-sans text-sm font-medium px-3 py-2 rounded-[var(--radius-btn)] transition-colors no-underline',
        variant === 'dark'
          ? active
            ? 'text-[var(--color-accent)] bg-[rgba(197,160,101,0.1)]'
            : 'text-[var(--color-text-on-dark-muted)] hover:text-white hover:bg-[rgba(255,255,255,0.06)]'
          // Light variant: hardcoded so the link stays readable on the
          // light header background regardless of the surrounding theme.
          : active
            ? 'text-[#0a192f] bg-[#f4f6f8]'
            : 'text-[#475569] hover:text-[#0a192f] hover:bg-[#f4f6f8]',
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
