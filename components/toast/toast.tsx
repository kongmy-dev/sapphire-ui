'use client';

import {
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const variants = ['success', 'info', 'warning', 'error'] as const;
export type ToastType = (typeof variants)[number];
export type ToastRef = {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
};
export type ToastProps = { ref?: Ref<ToastRef> | undefined };
type Notification = {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
};
const icons: Record<ToastType, ReactNode> = {
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m16 9-5.5 5.5L8 12" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  warning: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
};

function ToastItem({
  message,
  type = 'success',
  duration,
  remove,
}: {
  message: string;
  type?: ToastType;
  duration: number;
  remove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const removeRef = useRef(remove);
  removeRef.current = remove;
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true));
    const close = setTimeout(() => {
      cancelAnimationFrame(frame);
      setOpen(false);
    }, duration);
    const disposal = setTimeout(() => removeRef.current(), duration + 400);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(close);
      clearTimeout(disposal);
    };
  }, [duration]);
  return (
    <div
      className="sp-toast"
      data-slot="toast"
      data-variant={type}
      data-state={open ? 'open' : undefined}
    >
      <svg
        aria-hidden="true"
        className="sp-toast-icon sp-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[type]}
      </svg>
      <span className="sp-toast-message">{message}</span>
    </div>
  );
}

export function Toast({ ref }: ToastProps) {
  const [portal, setPortal] = useState<HTMLElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextId = useRef(0);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    setPortal(document.body);
    return () => {
      active.current = false;
    };
  }, []);
  useImperativeHandle(
    ref,
    () => ({
      show(message, type = 'success', durationMs = 5000) {
        if (!active.current) return;
        const notification = {
          id: nextId.current++,
          message,
          type,
          duration: Number.isFinite(durationMs)
            ? Math.max(0, durationMs)
            : 5000,
        };
        setNotifications((current) => [...current, notification]);
      },
    }),
    [],
  );
  const viewport = (
    <div
      className="sp-toast-viewport"
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          remove={() =>
            setNotifications((current) =>
              current.filter((item) => item.id !== notification.id),
            )
          }
        />
      ))}
    </div>
  );
  return portal === null ? viewport : createPortal(viewport, portal);
}
