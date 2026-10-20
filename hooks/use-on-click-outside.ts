'use client';

import { type RefObject, useEffect } from 'react';

type OutsideEvent = MouseEvent | TouchEvent | FocusEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: ((event: OutsideEvent) => void) | null | false,
): void {
  useEffect(() => {
    if (!handler) return;
    const listener = (event: OutsideEvent) => {
      const element = ref.current;
      if (!element || event.composedPath().includes(element)) return;
      handler(event);
    };
    const owner = ref.current?.ownerDocument ?? document;
    owner.addEventListener('mousedown', listener);
    owner.addEventListener('touchstart', listener, { passive: true });
    owner.addEventListener('focusin', listener);
    return () => {
      owner.removeEventListener('mousedown', listener);
      owner.removeEventListener('touchstart', listener);
      owner.removeEventListener('focusin', listener);
    };
  }, [ref, handler]);
}
