'use client';

import { type ComponentProps, type ReactNode, useId } from 'react';
import {
  type NavigationStateOptions,
  useNavigationState,
} from '../../lib/navigation-state.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '../sheet/sheet.js';
import { TooltipProvider } from '../tooltip/tooltip.js';
import { AdminContext, useAdminNavigation } from './admin-context.js';

export {
  AdminSidebarGroup,
  AdminSidebarLink,
  AdminSidebarSection,
} from './admin-navigation.js';

export type AdminLayoutProps = ComponentProps<'div'> &
  NavigationStateOptions & {
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
  desktopState,
  defaultDesktopState,
  onDesktopStateChange,
  mobileOpen,
  defaultMobileOpen,
  onMobileOpenChange,
  ...props
}: AdminLayoutProps) {
  const navigation = useNavigationState({
    desktopState,
    defaultDesktopState,
    onDesktopStateChange,
    mobileOpen,
    defaultMobileOpen,
    onMobileOpenChange,
  });
  const sidebarId = useId();
  return (
    <AdminContext.Provider value={{ ...navigation, sidebarId }}>
      <TooltipProvider delayDuration={150}>
        <Sheet
          open={navigation.isMobile && navigation.mobileOpen}
          onOpenChange={navigation.setMobileOpen}
        >
          <div
            {...props}
            className={['sp-admin-layout', className].filter(Boolean).join(' ')}
            data-slot="admin-layout"
          >
            {header === undefined ? <AdminHeader /> : header}
            {sidebar}
            <div className="sp-admin-layout-main">
              <main
                className={['sp-admin-layout-content', contentClassName]
                  .filter(Boolean)
                  .join(' ')}
                style={
                  contentMaxWidth ? { maxWidth: contentMaxWidth } : undefined
                }
              >
                {children}
              </main>
            </div>
          </div>
        </Sheet>
      </TooltipProvider>
    </AdminContext.Provider>
  );
}

type SidebarContent = ReactNode | ((state: { compact: boolean }) => ReactNode);
export type AdminSidebarProps = ComponentProps<'aside'> & {
  brand?: SidebarContent;
  footer?: SidebarContent;
  closeLabel?: string | undefined;
};

function sidebarContent(content: SidebarContent, compact: boolean) {
  return typeof content === 'function' ? content({ compact }) : content;
}

export function AdminSidebar({
  className,
  brand,
  footer,
  closeLabel = 'Close navigation',
  children,
  ...props
}: AdminSidebarProps) {
  const { compact, isMobile, sidebarId } = useAdminNavigation();
  const content = (
    <aside
      {...props}
      className={['sp-admin-layout-sidebar', className]
        .filter(Boolean)
        .join(' ')}
      data-slot="admin-sidebar"
      data-collapsed={compact || undefined}
      data-mobile={isMobile || undefined}
    >
      {brand !== undefined && (
        <div className="sp-admin-layout-sidebar-header">
          <div className="sp-admin-layout-brand">
            {sidebarContent(brand, compact)}
          </div>
        </div>
      )}
      <div className="sp-admin-layout-nav">{children}</div>
      {footer !== undefined && (
        <div className="sp-admin-layout-sidebar-footer">
          {sidebarContent(footer, compact)}
        </div>
      )}
    </aside>
  );
  if (!isMobile)
    return (
      <div id={sidebarId} className="sp-admin-layout-sidebar-region">
        {content}
      </div>
    );
  return (
    <SheetContent
      id={sidebarId}
      aria-modal="true"
      className="sp-admin-layout-drawer"
      side="left"
      closeLabel={closeLabel}
    >
      <SheetTitle className="sp-sr-only">
        {props['aria-label'] || 'Navigation'}
      </SheetTitle>
      <SheetDescription className="sp-sr-only">
        Application navigation
      </SheetDescription>
      {content}
    </SheetContent>
  );
}

function NavigationToggleIcon({
  mobile,
  compact,
}: {
  mobile: boolean;
  compact: boolean;
}) {
  return (
    <svg
      className="sp-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {mobile ? (
        <path d="M4 6h16M4 12h16M4 18h16" />
      ) : (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18" />
          <path d={compact ? 'm14 9 3 3-3 3' : 'm16 15-3-3 3-3'} />
        </>
      )}
    </svg>
  );
}

export function AdminSidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<'button'>) {
  const { compact, isMobile, mobileOpen, sidebarId, toggleNavigation } =
    useAdminNavigation();
  const expanded = isMobile ? mobileOpen : !compact;
  const desktopLabel = compact ? 'Expand sidebar' : 'Collapse sidebar';
  const label = isMobile ? 'Open navigation' : desktopLabel;
  return (
    <SheetTrigger asChild>
      <button
        {...props}
        type="button"
        className={['sp-admin-layout-toggle', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="admin-sidebar-trigger"
        aria-label={props['aria-label'] || label}
        aria-expanded={expanded}
        aria-controls={sidebarId}
        aria-haspopup={isMobile ? 'dialog' : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          toggleNavigation();
        }}
      >
        <NavigationToggleIcon mobile={isMobile} compact={compact} />
      </button>
    </SheetTrigger>
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
  children,
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
        <AdminSidebarTrigger />
        {leftSlot}
        {breadcrumbs && (
          <div className="sp-admin-layout-breadcrumbs">{breadcrumbs}</div>
        )}
      </div>
      <div className="sp-admin-layout-header-end">
        {rightSlot}
        {children}
      </div>
    </header>
  );
}
