import type { ComponentProps, ReactNode } from 'react';

const variants = ['light', 'dark'] as const;
type Variant = (typeof variants)[number];
export type SiteHeaderProps = ComponentProps<'header'> & {
  brand?: ReactNode;
  nav?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean | undefined;
  variant?: Variant | undefined;
};
export type SiteHeaderLinkProps = ComponentProps<'a'> & {
  href: string;
  active?: boolean | undefined;
  variant?: Variant | undefined;
};

export function SiteHeader({
  brand,
  nav,
  actions,
  sticky = true,
  variant = 'dark',
  children,
  className,
  ...props
}: SiteHeaderProps) {
  return (
    <header
      {...props}
      className={['sp-site-header', className].filter(Boolean).join(' ')}
      data-slot="site-header"
      data-variant={variant}
      data-sticky={sticky || undefined}
    >
      <div className="sp-site-header-inner">
        {brand && <div className="sp-site-header-brand">{brand}</div>}
        {nav && <nav className="sp-site-header-nav">{nav}</nav>}
        {actions && <div className="sp-site-header-actions">{actions}</div>}
        {children}
      </div>
    </header>
  );
}

export function SiteHeaderLink({
  active = false,
  variant = 'dark',
  children,
  className,
  ...props
}: SiteHeaderLinkProps) {
  return (
    <a
      {...props}
      className={['sp-site-header-link', className].filter(Boolean).join(' ')}
      data-slot="site-header-link"
      data-variant={variant}
      aria-current={active ? 'page' : props['aria-current']}
    >
      {children}
    </a>
  );
}
