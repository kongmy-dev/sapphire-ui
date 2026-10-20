import type { ComponentProps, ReactNode } from 'react';

const variants = ['light', 'dark'] as const;
type Variant = (typeof variants)[number];
export type SiteFooterProps = ComponentProps<'footer'> & {
  brand?: ReactNode;
  links?: ReactNode;
  bottom?: ReactNode;
  variant?: Variant | undefined;
};
export type SiteFooterGroupProps = ComponentProps<'div'> & { title: string };
export type SiteFooterLinkProps = ComponentProps<'a'> & {
  href: string;
  variant?: Variant | undefined;
};

export function SiteFooter({
  brand,
  links,
  bottom,
  variant = 'dark',
  children,
  className,
  ...props
}: SiteFooterProps) {
  return (
    <footer
      {...props}
      className={['sp-site-footer', className].filter(Boolean).join(' ')}
      data-slot="site-footer"
      data-variant={variant}
    >
      <div className="sp-site-footer-inner">
        {(brand || links) && (
          <div className="sp-site-footer-grid">
            {brand && <div className="sp-site-footer-brand">{brand}</div>}
            {links && <div className="sp-site-footer-links">{links}</div>}
          </div>
        )}
        {children}
        {bottom && <div className="sp-site-footer-bottom">{bottom}</div>}
      </div>
    </footer>
  );
}

export function SiteFooterGroup({
  title,
  children,
  className,
  ...props
}: SiteFooterGroupProps) {
  return (
    <div
      {...props}
      className={['sp-site-footer-group', className].filter(Boolean).join(' ')}
      data-slot="site-footer-group"
    >
      <span className="sp-site-footer-group-title">{title}</span>
      <div className="sp-site-footer-group-list">{children}</div>
    </div>
  );
}

export function SiteFooterLink({
  variant = 'dark',
  className,
  ...props
}: SiteFooterLinkProps) {
  return (
    <a
      {...props}
      className={['sp-site-footer-link', className].filter(Boolean).join(' ')}
      data-slot="site-footer-link"
      data-variant={variant}
    />
  );
}
