import { useState, useEffect, type MouseEvent, type ReactNode } from 'react';

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
   * Optional click interceptor for items. Useful for client-side routers —
   * call `event.preventDefault()` and route programmatically. The drawer
   * closes regardless. Without this, items navigate via standard <a href>.
   */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
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
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pathname, setPathname] = useState<string>(() =>
    typeof window === 'undefined' ? '' : window.location.pathname,
  );

  // Track pathname for active-link styling. popstate covers browser
  // back/forward; SPA push-state navigations should be signaled by the
  // consumer via the `active` prop on each item or by dispatching a
  // popstate-like event after route changes.
  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);

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

  const handleClick = (item: MobileNavItem) => (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.(item.href, event);
    setIsOpen(false);
  };

  const isActive = (item: MobileNavItem): boolean => {
    if (typeof item.active === 'boolean') return item.active;
    if (item.href === '/') return pathname === '/';
    return pathname === item.href;
  };

  return (
    <div className="md:hidden">
      {/* Fixed Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-white border-b border-white/10 px-4 flex items-center justify-start gap-1 z-40 shadow-md">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-2 rounded-md hover:bg-white/5 cursor-pointer text-white border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            {isOpen ? 'close' : 'menu'}
          </span>
        </button>

        <div className="flex items-center gap-1.5 ml-1">
          <span className="font-serif font-bold text-lg text-white">{brandName}</span>
          {brandSuffix && (
            <span className="font-sans font-light text-lg text-accent">{brandSuffix}</span>
          )}
          {version && (
            <span className="font-mono text-[10px] text-white/50 ml-1.5 self-end mb-0.5">{version}</span>
          )}
        </div>
      </header>

      {/* Backdrop Glass Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-primary text-white z-50 flex flex-col p-6 shadow-2xl transition-transform duration-300 ease-in-out border-r border-white/10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-bold text-xl text-white">{brandName}</span>
            {brandSuffix && (
              <span className="font-sans font-light text-xl text-accent">{brandSuffix}</span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center p-1.5 rounded-md hover:bg-white/5 cursor-pointer text-white border-none bg-transparent outline-none"
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              close
            </span>
          </button>
        </div>

        {version && (
          <div className="font-mono text-[10px] text-white/40 mb-6 px-1">
            {version}
          </div>
        )}

        <nav className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={handleClick(item)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-sans text-sm font-medium transition-colors no-underline ${
                  active
                    ? 'text-accent bg-[rgba(197,160,101,0.1)]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon && (
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {item.icon}
                  </span>
                )}
                {item.label}
              </a>
            );
          })}

          {extraActions && (
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
              {extraActions}
            </div>
          )}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider block">
            KONGMY Digital Solutions
          </span>
        </div>
      </aside>
    </div>
  );
}
