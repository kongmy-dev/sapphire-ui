'use client';

import { useRef } from 'react';

export function useFocusReturn() {
  const target = useRef<HTMLElement | null>(null);
  return {
    onOpenAutoFocus() {
      const active = document.activeElement;
      target.current = active instanceof HTMLElement ? active : null;
    },
    onCloseAutoFocus(event: Event) {
      if (!target.current?.isConnected) return;
      event.preventDefault();
      target.current.focus();
    },
  };
}
