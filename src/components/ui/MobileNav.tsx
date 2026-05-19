import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export interface MobileNavItem {
  to: string;
  label: string;
  icon?: string;
}

export interface MobileNavProps {
  brandName: string;
  brandSuffix?: string;
  version?: string;
  navItems: MobileNavItem[];
  extraActions?: React.ReactNode;
}

export function MobileNav({
  brandName,
  brandSuffix = '',
  version = '',
  navItems,
  extraActions
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close drawer on path change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
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

  return (
    <div className="md:hidden">
      {/* Fixed Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-primary text-white border-b border-white/10 px-4 flex items-center justify-start gap-1 z-40 shadow-md">
        {/* Hamburger Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-2 rounded-md hover:bg-white/5 cursor-pointer text-white border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Toggle navigation menu"
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
        {/* Drawer Header */}
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

        {/* Drawer Navigation Links */}
        <nav className="flex flex-col gap-1 overflow-y-auto pr-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-md font-sans text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-accent bg-[rgba(197,160,101,0.1)]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon && (
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {item.icon}
                </span>
              )}
              {item.label}
            </NavLink>
          ))}

          {extraActions && (
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
              {extraActions}
            </div>
          )}
        </nav>

        {/* Drawer Footer */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <span className="font-mono text-[9px] text-white/40 uppercase tracking-wider block">
            KONGMY Digital Solutions
          </span>
        </div>
      </aside>
    </div>
  );
}
