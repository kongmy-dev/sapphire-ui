import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../lib/utils';

/* ─── AdminLayout ───────────────────────────────────────────────────── */

export interface AdminLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** The admin sidebar element. Typically <AdminSidebar /> */
  sidebar: ReactNode;
  /** The admin top header. Typically <AdminHeader /> */
  header?: ReactNode;
  /** Main dashboard content */
  children: ReactNode;
  /** Class name for the inner main content wrapper */
  contentClassName?: string;
}

const AdminLayout = forwardRef<HTMLDivElement, AdminLayoutProps>(
  ({ className, sidebar, header, children, contentClassName, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'text-main flex min-h-screen w-full bg-surface font-sans transition-colors duration-200',
          className
        )}
        {...props}
      >
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {header}
          <main
            className={cn(
              'mx-auto w-full max-w-7xl flex-1 overflow-y-auto px-6 py-8 md:px-8',
              contentClassName
            )}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);
AdminLayout.displayName = 'AdminLayout';

/* ─── AdminSidebar ──────────────────────────────────────────────────── */

export interface AdminSidebarProps extends HTMLAttributes<HTMLDivElement> {
  /** Logo or branding element at the top of the sidebar */
  brand?: ReactNode;
  /** Controls if the sidebar is visually collapsed */
  collapsed?: boolean;
  /** Event triggered when collapse state is toggled */
  onToggleCollapse?: (collapsed: boolean) => void;
  /** Footer element, such as profile info or sign-out */
  footer?: ReactNode;
  children?: ReactNode;
}

const AdminSidebar = forwardRef<HTMLDivElement, AdminSidebarProps>(
  ({ className, brand, collapsed = false, onToggleCollapse, footer, children, ...props }, ref) => {
    const isControlled = onToggleCollapse !== undefined;
    const [localCollapsed, setLocalCollapsed] = useState(false);
    const activeCollapsed = isControlled ? collapsed : localCollapsed;

    const handleToggle = () => {
      if (isControlled) {
        onToggleCollapse?.(!collapsed);
      } else {
        setLocalCollapsed(!localCollapsed);
      }
    };

    return (
      <aside
        ref={ref}
        className={cn(
          'relative z-30 flex h-screen shrink-0 flex-col border-r border-border-dark bg-primary text-white transition-all duration-300 ease-in-out',
          activeCollapsed ? 'w-16' : 'w-64',
          className
        )}
        {...props}
      >
        {/* Brand/Logo Area */}
        <div className="flex h-16 items-center justify-between border-b border-border-dark px-4">
          <div className={cn('overflow-hidden transition-all duration-300', activeCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100')}>
            {brand}
          </div>
          <button
            type="button"
            onClick={handleToggle}
            aria-label={activeCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex size-8 cursor-pointer items-center justify-center rounded-btn border-none bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
            style={{ outline: 'none' }}
          >
            <span className="material-symbols-outlined text-[18px]">
              {activeCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 scrollbar-thin scrollbar-thumb-white/10 space-y-6 overflow-y-auto px-2 py-4">
          {children}
        </div>

        {/* Footer Area */}
        {footer && (
          <div className="border-t border-border-dark p-3">
            {footer}
          </div>
        )}
      </aside>
    );
  }
);
AdminSidebar.displayName = 'AdminSidebar';

/* ─── AdminSidebarSection ───────────────────────────────────────────── */

export interface AdminSidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  /** The header title of this group of links */
  title?: string;
  /** Whether the sidebar is collapsed (to hide the section title) */
  collapsed?: boolean;
  children: ReactNode;
}

const AdminSidebarSection = forwardRef<HTMLDivElement, AdminSidebarSectionProps>(
  ({ className, title, collapsed = false, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-1', className)} {...props}>
        {title && !collapsed && (
          <h5 className="px-3 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
            {title}
          </h5>
        )}
        <nav className="space-y-0.5">{children}</nav>
      </div>
    );
  }
);
AdminSidebarSection.displayName = 'AdminSidebarSection';

/* ─── AdminSidebarLink ──────────────────────────────────────────────── */

export interface AdminSidebarLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  /** Render as standard HTML anchor or polymorphically (e.g. NavLink) */
  asChild?: boolean;
  /** Icon name from Material Symbols Outlined */
  icon?: string;
  /** Visual indicator for current active tab */
  active?: boolean;
  /** Optional badge or counter display */
  badge?: ReactNode;
  /** Optional click handler */
  onClick?: () => void;
  /** Sidebar collapse status to hide text label */
  collapsed?: boolean;
}

const AdminSidebarLink = forwardRef<HTMLAnchorElement, AdminSidebarLinkProps>(
  ({ className, asChild = false, icon, active = false, badge, collapsed = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';
    return (
      <Comp
        ref={ref}
        className={cn(
          'group flex items-center gap-3 rounded-btn px-3 py-2.5 font-sans text-sm font-medium no-underline transition-all duration-150',
          active
            ? 'border-l-2 border-accent bg-accent/10 text-accent'
            : 'text-white/70 hover:bg-white/5 hover:text-white',
          collapsed ? 'justify-center px-0' : '',
          className
        )}
        {...props}
      >
        {icon && (
          <span
            className={cn(
              'material-symbols-outlined text-[20px] transition-colors',
              active ? 'text-accent' : 'text-white/50 group-hover:text-white'
            )}
          >
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1 truncate">{children}</span>}
        {!collapsed && badge && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/20 px-1.5 font-mono text-[10px] font-bold text-accent">
            {badge}
          </span>
        )}
      </Comp>
    );
  }
);
AdminSidebarLink.displayName = 'AdminSidebarLink';

/* ─── AdminHeader ───────────────────────────────────────────────────── */

export interface AdminHeaderProps extends HTMLAttributes<HTMLElement> {
  /** Navigation or search trigger slot on left */
  leftSlot?: ReactNode;
  /** Breadcrumb slot */
  breadcrumbs?: ReactNode;
  /** Action icons/buttons on right (theme toggle, alerts, profile) */
  rightSlot?: ReactNode;
}

const AdminHeader = forwardRef<HTMLElement, AdminHeaderProps>(
  ({ className, leftSlot, breadcrumbs, rightSlot, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'dark:bg-card-bg z-20 flex h-16 w-full items-center justify-between border-b border-border bg-white px-6 shadow-sm transition-colors duration-200',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          {leftSlot}
          {breadcrumbs && <div className="hidden sm:block">{breadcrumbs}</div>}
        </div>
        <div className="flex items-center gap-4">
          {rightSlot}
        </div>
      </header>
    );
  }
);
AdminHeader.displayName = 'AdminHeader';

export {
  AdminLayout,
  AdminSidebar,
  AdminSidebarSection,
  AdminSidebarLink,
  AdminHeader,
};
