'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

const desktopStates = ['expanded', 'compact'] as const;

export type NavigationStateOptions = {
  desktopState?: (typeof desktopStates)[number] | undefined;
  defaultDesktopState?: (typeof desktopStates)[number] | undefined;
  onDesktopStateChange?:
    | ((state: (typeof desktopStates)[number]) => void)
    | undefined;
  mobileOpen?: boolean | undefined;
  defaultMobileOpen?: boolean | undefined;
  onMobileOpenChange?: ((open: boolean) => void) | undefined;
};

function subscribe(callback: () => void) {
  const media = window.matchMedia('(width < 48rem)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

function mobileSnapshot() {
  return window.matchMedia('(width < 48rem)').matches;
}

function serverSnapshot() {
  return false;
}

function useNavigationValue<T>(
  value: T | undefined,
  fallback: T,
  onChange: ((next: T) => void) | undefined,
) {
  const [local, setLocal] = useState(fallback);
  const current = value === undefined ? local : value;
  const change = useCallback(
    (next: T) => {
      if (value === undefined) setLocal(next);
      onChange?.(next);
    },
    [value, onChange],
  );
  return [current, change] as const;
}

export function useNavigationState({
  desktopState: controlledDesktop,
  defaultDesktopState = 'expanded',
  onDesktopStateChange,
  mobileOpen: controlledMobile,
  defaultMobileOpen = false,
  onMobileOpenChange,
}: NavigationStateOptions) {
  const isMobile = useSyncExternalStore(
    subscribe,
    mobileSnapshot,
    serverSnapshot,
  );
  const [desktopState, setDesktopState] = useNavigationValue(
    controlledDesktop,
    defaultDesktopState,
    onDesktopStateChange,
  );
  const [mobileOpen, setMobileOpen] = useNavigationValue(
    controlledMobile,
    defaultMobileOpen,
    onMobileOpenChange,
  );
  useEffect(() => {
    if (!isMobile && mobileOpen) setMobileOpen(false);
  }, [isMobile, mobileOpen, setMobileOpen]);
  function toggleNavigation() {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setDesktopState(desktopState === 'expanded' ? 'compact' : 'expanded');
  }
  return {
    desktopState,
    setDesktopState,
    mobileOpen,
    setMobileOpen,
    isMobile,
    compact: !isMobile && desktopState === 'compact',
    toggleNavigation,
  };
}
