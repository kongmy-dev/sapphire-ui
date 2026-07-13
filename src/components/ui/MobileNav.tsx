import { type MouseEvent, type ReactNode, useEffect, useState } from 'react';

export interface MobileNavItem {
  href: string;
  label: string;
  icon?: string;
  /** Override active state. Defaults to `window.location.pathname === href`. */
  active?: boolean;
}

export interface MobileNavProps {
  brandName: string;
  brandSuffix?: string;
  version?: string;
  navItems: MobileNavItem[];
  extraActions?: ReactNode;
  /**
   * Optional pathname. If provided, overrides internal window.location tracking.
   * Useful when wrapping with React Router's useLocation().
   */
  pathname?: string;
  /**
   * Optional click interceptor for items. Useful for client-side routers —
   * call `event.preventDefault()` and route programmatically. The drawer
   * closes regardless. Without this, items navigate via standard <a href>.
   */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Accessible label for the menu toggle button (override for i18n). */
  toggleLabel?: string;
  /** Accessible label for the drawer close button (override for i18n). */
  closeLabel?: string;
}

/**
 * Mobile drawer navigation. Router-agnostic — works with plain anchors,
 * React Router (via `onNavigate` interceptor), Next.js, Astro view
 * transitions, or any other navigation strategy.
 */
export function MobileNav({
  brandName,
  brandSuffix = '',
  version = '',
  navItems,
  extraActions,
  onNavigate,
  pathname: externalPathname,
  toggleLabel = 'Toggle navigation menu',
  closeLabel = 'Close navigation menu',
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalPathname, setInternalPathname] = useState<string>(() =>
    typeof window === 'undefined' ? '' : window.location.pathname,
  );

  const currentPathname =
    externalPathname !== undefined ? externalPathname : internalPathname;

  // Track pathname for active-link styling. popstate covers browser
  // back/forward; SPA push-state navigations should be signaled by the
  // consumer via the `active` prop on each item or by dispatching a
  // popstate-like event after route changes.
  useEffect(() => {
    if (externalPathname !== undefined) return;
    const update = () => setInternalPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [externalPathname]);

  // Lock body scroll when drawer is open.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClick =
    (item: MobileNavItem) => (event: MouseEvent<HTMLAnchorElement>) => {
      onNavigate?.(item.href, event);
      setIsOpen(false);
    };

  const isActive = (item: MobileNavItem): boolean => {
    if (typeof item.active === 'boolean') return item.active;
    if (item.href === '/') return currentPathname === '/';
    return currentPathname === item.href;
  };

  return (
    <div className="md:hidden">
      {/* Fixed Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-start gap-1 border-white/10 border-b bg-primary px-4 text-text-on-dark shadow-md">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-2 text-text-on-dark outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={toggleLabel}
          aria-expanded={isOpen}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div className="ml-1 flex items-center gap-1.5">
          <span className="font-bold font-serif text-lg text-text-on-dark">
            {brandName}
          </span>
          {brandSuffix && (
            <span className="font-light font-sans text-accent text-lg">
              {brandSuffix}
            </span>
          )}
          {version && (
            <span className="mb-0.5 ml-1.5 self-end font-mono text-[10px] text-text-on-dark/50">
              {version}
            </span>
          )}
        </div>
      </header>

      {/* Backdrop Glass Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(280px,85vw)] flex-col border-white/10 border-r bg-primary p-6 text-text-on-dark shadow-2xl transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-bold font-serif text-text-on-dark text-xl">
              {brandName}
            </span>
            {brandSuffix && (
              <span className="font-light font-sans text-accent text-xl">
                {brandSuffix}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex cursor-pointer items-center justify-center rounded-md border-none bg-transparent p-2 text-text-on-dark outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={closeLabel}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 20 }}
            >
              close
            </span>
          </button>
        </div>

        {version && (
          <div className="mb-6 px-1 font-mono text-[10px] text-text-on-dark/40">
            {version}
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={handleClick(item)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-md px-4 py-2.5 font-medium font-sans text-sm no-underline transition-colors ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-on-dark/70 hover:bg-white/5 hover:text-text-on-dark'
                }`}
              >
                {item.icon && (
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 18 }}
                  >
                    {item.icon}
                  </span>
                )}
                {item.label}
              </a>
            );
          })}

          {extraActions && (
            <div className="mt-2 flex flex-col gap-1 border-white/5 border-t pt-2">
              {extraActions}
            </div>
          )}
        </nav>

        <div className="mt-auto border-white/10 border-t pt-4">
          <a
            href="https://kongmy.dev/?utm_source=sapphire-ui&utm_medium=sidebar"
            target="_blank"
            rel="noopener noreferrer"
            className="block font-mono text-[9px] text-text-on-dark/40 uppercase tracking-wider no-underline transition-colors hover:text-text-on-dark"
          >
            kongmy.dev
          </a>
        </div>
      </aside>
    </div>
  );
}
