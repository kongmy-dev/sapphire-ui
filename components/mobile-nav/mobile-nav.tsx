'use client';

import { Dialog as Primitive } from 'radix-ui';
import {
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from 'react';

export type MobileNavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon?: ReactElement | undefined;
  readonly active?: boolean | undefined;
};
export type MobileNavProps = {
  brandName: string;
  brandSuffix?: string | undefined;
  version?: string | undefined;
  navItems: readonly MobileNavItem[];
  extraActions?: ReactNode;
  pathname?: string | undefined;
  onNavigate?:
    | ((href: string, event: MouseEvent<HTMLAnchorElement>) => void)
    | undefined;
  toggleLabel?: string | undefined;
  closeLabel?: string | undefined;
};

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="sp-mobile-nav-icon sp-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

function Brand({
  name,
  suffix,
  ...props
}: ComponentProps<'div'> & { name: string; suffix: string }) {
  return (
    <div {...props} className="sp-mobile-nav-brand">
      <span className="sp-mobile-nav-brand-name">{name}</span>
      {suffix && <span className="sp-mobile-nav-brand-suffix">{suffix}</span>}
    </div>
  );
}

function Drawer({
  container,
  brandName,
  brandSuffix = '',
  version = '',
  navItems,
  extraActions,
  pathname,
  closeLabel = 'Close navigation menu',
  onNavigate,
  closeNav,
}: MobileNavProps & {
  container: HTMLDivElement | null;
  closeNav: () => void;
}) {
  return (
    <Primitive.Portal container={container}>
      <Primitive.Overlay className="sp-mobile-nav-scrim" />
      <Primitive.Content className="sp-mobile-nav-drawer">
        <div className="sp-mobile-nav-drawer-header">
          <Primitive.Title asChild>
            <Brand name={brandName} suffix={brandSuffix} />
          </Primitive.Title>
          <Primitive.Close
            type="button"
            className="sp-mobile-nav-close"
            aria-label={closeLabel}
          >
            <CloseIcon />
          </Primitive.Close>
        </div>
        <Primitive.Description className="sp-sr-only">
          Site navigation
        </Primitive.Description>
        {version && (
          <div className="sp-mobile-nav-drawer-version">{version}</div>
        )}
        <nav className="sp-mobile-nav-links" aria-label="Primary">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="sp-mobile-nav-link"
              aria-current={
                (item.active ?? item.href === pathname) ? 'page' : undefined
              }
              onClick={(event) => {
                onNavigate?.(item.href, event);
                closeNav();
              }}
            >
              {item.icon && (
                <span className="sp-mobile-nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </a>
          ))}
          {extraActions && (
            <div className="sp-mobile-nav-extras">{extraActions}</div>
          )}
        </nav>
        <div className="sp-mobile-nav-footer">
          <a
            className="sp-mobile-nav-footer-link"
            href="https://kongmy.dev/?utm_source=sapphire-ui&utm_medium=sidebar"
            target="_blank"
            rel="noopener noreferrer"
          >
            kongmy.dev
          </a>
        </div>
      </Primitive.Content>
    </Primitive.Portal>
  );
}

export function MobileNav({
  brandName,
  brandSuffix = '',
  version = '',
  navItems,
  extraActions,
  pathname,
  toggleLabel = 'Toggle navigation menu',
  closeLabel = 'Close navigation menu',
  onNavigate,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [internalPathname, setInternalPathname] = useState('');
  useEffect(() => {
    if (pathname !== undefined) return;
    const update = () => setInternalPathname(window.location.pathname);
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 48rem)');
    const update = () => {
      if (media.matches) setIsOpen(false);
    };
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return (
    <div
      ref={setContainer}
      className="sp-mobile-nav"
      data-slot="mobile-nav"
      data-state={isOpen ? 'open' : undefined}
    >
      <Primitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <header className="sp-mobile-nav-bar">
          <Primitive.Trigger
            type="button"
            className="sp-mobile-nav-toggle"
            aria-label={toggleLabel}
          >
            {isOpen ? (
              <CloseIcon />
            ) : (
              <svg
                aria-hidden="true"
                className="sp-mobile-nav-icon sp-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </Primitive.Trigger>
          <Brand name={brandName} suffix={brandSuffix} />
          {version && <span className="sp-mobile-nav-version">{version}</span>}
        </header>
        <Drawer
          container={container}
          brandName={brandName}
          brandSuffix={brandSuffix}
          version={version}
          navItems={navItems}
          extraActions={extraActions}
          pathname={pathname ?? internalPathname}
          closeLabel={closeLabel}
          onNavigate={onNavigate}
          closeNav={() => setIsOpen(false)}
        />
      </Primitive.Root>
    </div>
  );
}
