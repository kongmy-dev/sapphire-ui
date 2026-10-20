'use client';

import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

const variants = ['info', 'success', 'warning', 'error', 'brand'] as const;
export type BannerVariant = (typeof variants)[number];
export type BannerRef = { dismiss: () => void; show: () => void };
export type BannerProps = {
  variant?: BannerVariant | undefined;
  dismissible?: boolean | undefined;
  storageKey?: string | undefined;
  onDismiss?: (() => void) | undefined;
  children?: ReactNode;
  className?: string | undefined;
  ref?: Ref<BannerRef> | undefined;
};

function wasDismissed(key: string | undefined): boolean {
  if (!key) return false;
  try {
    return window.localStorage.getItem(`sapphire-banner:${key}`) === '1';
  } catch {
    return false;
  }
}

function persist(key: string | undefined, hidden: boolean): void {
  if (!key) return;
  try {
    const name = `sapphire-banner:${key}`;
    if (hidden) window.localStorage.setItem(name, '1');
    else window.localStorage.removeItem(name);
  } catch {
    return;
  }
}

export function Banner({
  variant = 'info',
  dismissible = true,
  storageKey,
  onDismiss,
  children,
  className,
  ref,
}: BannerProps) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => setHidden(wasDismissed(storageKey)), [storageKey]);
  const dismiss = useCallback(() => {
    persist(storageKey, true);
    setHidden(true);
    onDismiss?.();
  }, [storageKey, onDismiss]);
  const show = useCallback(() => {
    persist(storageKey, false);
    setHidden(false);
  }, [storageKey]);
  useImperativeHandle(ref, () => ({ dismiss, show }), [dismiss, show]);
  return (
    <div
      hidden={hidden}
      className={['sp-banner', className].filter(Boolean).join(' ')}
      data-slot="banner"
      data-variant={variant}
    >
      {children}
      {dismissible && (
        <button
          type="button"
          className="sp-banner-dismiss"
          aria-label="Dismiss"
          onClick={dismiss}
        >
          <svg
            className="sp-icon"
            viewBox="0 0 14 14"
            width="14"
            height="14"
            aria-hidden="true"
          >
            <path
              d="M2 2l10 10M12 2L2 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
