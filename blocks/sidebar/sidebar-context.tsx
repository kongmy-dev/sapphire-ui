'use client';

import * as React from 'react';
import { Sheet } from '../../components/sheet/sheet.js';
import { TooltipProvider } from '../../components/tooltip/tooltip.js';
import { useNavigationState } from '../../lib/navigation-state.js';
import { cn } from '../classes.js';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  sidebarId: string;
  toggleSidebar: () => void;
};
const SidebarContext = React.createContext<SidebarContextProps | null>(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context)
    throw new Error('useSidebar must be used within a SidebarProvider.');
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const controlledDesktop = controlledOpen ? 'expanded' : 'compact';
  const navigation = useNavigationState({
    desktopState: controlledOpen === undefined ? undefined : controlledDesktop,
    defaultDesktopState: defaultOpen ? 'expanded' : 'compact',
    onDesktopStateChange: (state) => onOpenChange?.(state === 'expanded'),
  });
  const sidebarId = React.useId();
  const context: SidebarContextProps = {
    state: navigation.desktopState === 'expanded' ? 'expanded' : 'collapsed',
    open: navigation.desktopState === 'expanded',
    setOpen: (open: boolean) =>
      navigation.setDesktopState(open ? 'expanded' : 'compact'),
    openMobile: navigation.mobileOpen,
    setOpenMobile: navigation.setMobileOpen,
    isMobile: navigation.isMobile,
    sidebarId,
    toggleSidebar: navigation.toggleNavigation,
  };
  return (
    <SidebarContext.Provider value={context}>
      <TooltipProvider delayDuration={0}>
        <Sheet
          open={navigation.isMobile && navigation.mobileOpen}
          onOpenChange={navigation.setMobileOpen}
        >
          <div
            data-slot="sidebar-wrapper"
            style={style}
            className={cn(
              'sp-sidebar-wrapper group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full',
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </Sheet>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

export { SidebarProvider, useSidebar };
