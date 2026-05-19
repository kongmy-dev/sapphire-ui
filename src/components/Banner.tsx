import React, { useRef, useImperativeHandle, useEffect, forwardRef, type ReactNode } from 'react';
import './BannerElement';
import { BannerElement, type BannerVariant } from './BannerElement';

export interface BannerRef {
  /** Dismiss the banner imperatively. */
  dismiss: () => void;
  /** Re-show after dismissal. Clears the localStorage flag if storageKey is set. */
  show: () => void;
}

export interface BannerProps {
  variant?: BannerVariant;
  /** Show an × dismiss button. Defaults to true. */
  dismissible?: boolean;
  /**
   * Persist dismissals to localStorage under this key. Once dismissed,
   * the banner stays hidden on subsequent mounts. Omit for ephemeral
   * banners that reappear on every page load.
   */
  storageKey?: string;
  /** Fired when the user dismisses the banner. */
  onDismiss?: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * React wrapper around the <sapphire-banner> Web Component. The banner
 * itself is framework-agnostic — Astro/HTML consumers can use the custom
 * element directly:
 *
 *   <sapphire-banner variant="warning" dismissible storage-key="v2-launch">
 *     We've shipped a new version! <a href="...">Read more</a>
 *   </sapphire-banner>
 */
const Banner = forwardRef<BannerRef, BannerProps>(
  ({ variant = 'info', dismissible = true, storageKey, onDismiss, children, className }, ref) => {
    const elRef = useRef<HTMLElement>(null);

    useImperativeHandle(ref, () => ({
      dismiss: () => (elRef.current as BannerElement | null)?.dismiss?.(),
      show: () => (elRef.current as BannerElement | null)?.show?.(),
    }), []);

    useEffect(() => {
      const el = elRef.current;
      if (!el || !onDismiss) return;
      el.addEventListener('dismiss', onDismiss);
      return () => el.removeEventListener('dismiss', onDismiss);
    }, [onDismiss]);

    return React.createElement(
      'sapphire-banner',
      {
        ref: elRef,
        variant,
        ...(dismissible ? { dismissible: '' } : {}),
        ...(storageKey ? { 'storage-key': storageKey } : {}),
        class: className,
      },
      children,
    );
  },
);
Banner.displayName = 'Banner';

export { Banner };
export type { BannerVariant };
