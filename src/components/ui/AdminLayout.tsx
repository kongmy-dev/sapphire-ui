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
          'text-main grid min-h-screen w-full grid-cols-[248px_1fr] bg-surface font-sans transition-colors duration-200 max-[760px]:grid-cols-1',
          className
        )}
        {...props}
      >
        {sidebar}
        <div className="flex min-w-0 flex-col">
          {header}
          <main
            className={cn(
              'mx-auto w-full max-w-[1280px] flex-1 overflow-y-auto px-8 py-8 pb-20 max-[760px]:px-4 max-[760px]:py-6',
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
          'relative z-30 flex h-screen shrink-0 flex-col border-r border-border-dark bg-primary text-(--color-text-on-dark) transition-all duration-300 ease-in-out max-[760px]:h-auto max-[760px]:border-r-0 max-[760px]:border-b',
          activeCollapsed ? 'w-16' : 'w-full',
          className
        )}
        {...props}
      >
        {/* Brand/Logo Area */}
        <div className="flex items-center gap-2.5 border-b border-border-dark px-[22px] pt-[22px] pb-[18px]">
          <div className={cn('overflow-hidden transition-all duration-300', activeCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100')}>
            {brand}
          </div>
          <button
            type="button"
            onClick={handleToggle}
            aria-label={activeCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex size-8 cursor-pointer items-center justify-center rounded-btn border-none bg-white/5 text-(--color-text-on-dark)/70 hover:bg-white/10 hover:text-(--color-text-on-dark)"
            style={{ outline: 'none' }}
          >
            <span className="material-symbols-outlined text-[18px]">
              {activeCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 scrollbar-thin scrollbar-thumb-white/10 overflow-y-auto px-3 py-3.5">
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
      <div ref={ref} className={cn('', className)} {...props}>
        {title && !collapsed && (
          <h5 className="mx-3 mt-[18px] mb-2 font-sans text-[10px] font-semibold tracking-[0.12em] text-(--color-text-on-dark-muted) uppercase first:mt-1">
            {title}
          </h5>
        )}
        <nav className="flex flex-col gap-0.5">{children}</nav>
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
          'group flex items-center gap-2.5 rounded-md px-3 py-2 font-sans text-[14px] font-medium no-underline transition-all duration-150',
          active
            ? 'bg-accent/12 text-accent'
            : 'text-(--color-text-on-dark) hover:bg-white/5 hover:text-(--color-text-on-dark)',
          collapsed ? 'justify-center px-0' : '',
          className
        )}
        {...props}
      >
        {icon && (
          <span
            className={cn(
              'material-symbols-outlined text-[18px] transition-colors',
              active ? 'text-accent opacity-100' : 'opacity-70 group-hover:opacity-100 group-hover:text-white'
            )}
          >
            {icon}
          </span>
        )}
        {!collapsed && <span className="flex-1 truncate">{children}</span>}
        {!collapsed && badge && (
          <span className="ml-auto font-mono text-[11px] text-(--color-text-on-dark-muted)">
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
          'z-10 flex w-full items-center gap-4 border-b border-border bg-card px-8 py-3.5 transition-colors duration-200 sticky top-0 max-[760px]:flex-wrap max-[760px]:gap-3 max-[760px]:px-4',
          className
        )}
        {...props}
      >
        <div className="flex max-w-[420px] flex-1 items-center gap-4 max-[760px]:max-w-none max-[760px]:basis-full">
          {leftSlot}
          {breadcrumbs && <div className="hidden sm:block">{breadcrumbs}</div>}
        </div>
        <div className="flex items-center gap-4 max-[760px]:flex-wrap max-[760px]:gap-2">
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
