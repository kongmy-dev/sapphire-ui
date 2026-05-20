import React, { useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import './ToastElement';
import type { ToastType } from './ToastElement';

export interface ToastRef {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
}

export interface ToastProps {}

/**
 * React wrapper for the <sapphire-toast> Web Component.
 *
 * Usage:
 * ```tsx
 * const toastRef = useRef<ToastRef>(null);
 * <Toast ref={toastRef} />
 * <Button onClick={() => toastRef.current?.show('Saved!', 'success')}>Save</Button>
 * ```
 */
const Toast = forwardRef<ToastRef, ToastProps>((_, ref) => {
  const elRef = useRef<HTMLElement>(null);

  const show = useCallback((message: string, type: ToastType = 'success', durationMs = 5000) => {
    const el = elRef.current as any;
    el?.show?.(message, type, durationMs);
  }, []);

  useImperativeHandle(ref, () => ({ show }), [show]);

  return React.createElement('sapphire-toast', { ref: elRef });
});
Toast.displayName = 'Toast';

export { Toast };
export type { ToastType };
