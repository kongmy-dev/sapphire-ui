'use client';

import {
  Children,
  type ComponentProps,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';
import { Slot } from '../../lib/slot.js';

export type AdminLayoutProps = ComponentProps<'div'> & {
  sidebar: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  contentClassName?: string | undefined;
  contentMaxWidth?: string | undefined;
};

export function AdminLayout({
  className,
  sidebar,
  header,
  children,
  contentClassName,
  contentMaxWidth,
  ...props
}: AdminLayoutProps) {
  return (
    <div
      {...props}
      className={['sp-admin-layout', className].filter(Boolean).join(' ')}
      data-slot="admin-layout"
    >
      {sidebar}
      <div className="sp-admin-layout-main">
        {header}
        <main
          className={['sp-admin-layout-content', contentClassName]
            .filter(Boolean)
            .join(' ')}
          style={contentMaxWidth ? { maxWidth: contentMaxWidth } : undefined}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export type AdminSidebarProps = ComponentProps<'aside'> & {
  brand?: ReactNode;
  collapsed?: boolean | undefined;
  onToggleCollapse?: ((collapsed: boolean) => void) | undefined;
  footer?: ReactNode;
  expandLabel?: string | undefined;
  collapseLabel?: string | undefined;
};

export function AdminSidebar({
  className,
  brand,
  collapsed = false,
  onToggleCollapse,
  footer,
  expandLabel = 'Expand sidebar',
  collapseLabel = 'Collapse sidebar',
  children,
  ...props
}: AdminSidebarProps) {
  const [localCollapsed, setLocalCollapsed] = useState(collapsed);
  const activeCollapsed =
    onToggleCollapse === undefined ? localCollapsed : collapsed;
  const toggle = () => {
    if (onToggleCollapse) onToggleCollapse(!collapsed);
    else setLocalCollapsed(!localCollapsed);
  };
  return (
    <aside
      {...props}
      className={['sp-admin-layout-sidebar', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="admin-sidebar"
      data-collapsed={activeCollapsed || undefined}
    >
      <div className="sp-admin-layout-sidebar-header">
        <div className="sp-admin-layout-brand" inert={activeCollapsed}>
          {brand}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label={activeCollapsed ? expandLabel : collapseLabel}
          aria-expanded={!activeCollapsed}
          className="sp-admin-layout-toggle"
        >
          <svg
            className="sp-icon"
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path
              d={
                activeCollapsed
                  ? 'M4 6h16M4 12h10M4 18h16m12-9 3 3-3 3'
                  : 'M4 6h16M4 12h16M4 18h16'
              }
            />
          </svg>
        </button>
      </div>
      <div className="sp-admin-layout-nav">{children}</div>
      {footer && <div className="sp-admin-layout-sidebar-footer">{footer}</div>}
    </aside>
  );
}

export type AdminSidebarSectionProps = ComponentProps<'div'> & {
  title?: string | undefined;
  collapsed?: boolean | undefined;
  children: ReactNode;
};

export function AdminSidebarSection({
  title,
  collapsed = false,
  children,
  ...props
}: AdminSidebarSectionProps) {
  return (
    <div {...props} data-slot="admin-sidebar-section">
      {title && !collapsed && (
        <h5 className="sp-admin-layout-section-title">{title}</h5>
      )}
      <nav className="sp-admin-layout-links">{children}</nav>
    </div>
  );
}

export type AdminSidebarLinkProps = ComponentProps<'a'> & {
  asChild?: boolean | undefined;
  icon?: ReactElement | null | undefined;
  active?: boolean | undefined;
  badge?: ReactNode;
  collapsed?: boolean | undefined;
};

function AdminLinkContent({
  icon,
  collapsed,
  badge,
  children,
}: Pick<AdminSidebarLinkProps, 'icon' | 'collapsed' | 'badge' | 'children'>) {
  const labelClass = ['sp-admin-layout-label', collapsed && 'sp-sr-only']
    .filter(Boolean)
    .join(' ');
  return (
    <>
      {icon && (
        <span className="sp-admin-layout-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={labelClass}>{children}</span>
      {!collapsed && badge && (
        <span className="sp-admin-layout-badge">{badge}</span>
      )}
    </>
  );
}

export function AdminSidebarLink({
  className,
  asChild = false,
  icon,
  active = false,
  badge,
  collapsed = false,
  children,
  ...props
}: AdminSidebarLinkProps) {
  const Root = asChild ? Slot : 'a';
  const candidate = asChild ? Children.only(children) : undefined;
  const child = isValidElement<{ children?: ReactNode }>(candidate)
    ? candidate
    : undefined;
  const content = (
    <AdminLinkContent icon={icon} collapsed={collapsed} badge={badge}>
      {child ? child.props.children : children}
    </AdminLinkContent>
  );
  return (
    <Root
      {...props}
      className={['sp-admin-layout-link', className].filter(Boolean).join(' ')}
      data-slot="admin-sidebar-link"
      data-collapsed={collapsed || undefined}
      aria-current={active ? 'page' : props['aria-current']}
    >
      {child ? cloneElement(child, { children: content }) : content}
    </Root>
  );
}

export type AdminHeaderProps = ComponentProps<'header'> & {
  leftSlot?: ReactNode;
  breadcrumbs?: ReactNode;
  rightSlot?: ReactNode;
};

export function AdminHeader({
  className,
  leftSlot,
  breadcrumbs,
  rightSlot,
  ...props
}: AdminHeaderProps) {
  return (
    <header
      {...props}
      className={['sp-admin-layout-header', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="admin-header"
    >
      <div className="sp-admin-layout-header-start">
        {leftSlot}
        {breadcrumbs && (
          <div className="sp-admin-layout-breadcrumbs">{breadcrumbs}</div>
        )}
      </div>
      <div className="sp-admin-layout-header-end">{rightSlot}</div>
    </header>
  );
}
