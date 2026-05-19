import { useEffect, type RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent | FocusEvent;

/**
 * Fire `handler` when the user clicks (or touches, or focuses) anything
 * outside the referenced element. Use for closing menus, dropdowns, and
 * lightweight popovers that don't already get this behaviour from a Radix
 * primitive.
 *
 *   const ref = useRef<HTMLDivElement>(null);
 *   useOnClickOutside(ref, () => setOpen(false));
 *
 * Pass a falsy `handler` to detach without unmounting.
 */
export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: ((event: AnyEvent) => void) | null | false,
): void {
  useEffect(() => {
    if (!handler) return;
    const callback = handler;

    function listener(event: AnyEvent) {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      callback(event);
    }

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener, { passive: true });
    document.addEventListener('focusin', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
      document.removeEventListener('focusin', listener);
    };
  }, [ref, handler]);
}
