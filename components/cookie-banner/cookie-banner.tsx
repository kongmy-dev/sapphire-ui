'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
} from '../../lib/consent.js';
import { Button } from '../button/button.js';

export type CookieBannerProps = {
  forceShow?: boolean | undefined;
  onClose?: (() => void) | undefined;
};

export function CookieBanner({
  forceShow = false,
  onClose,
}: CookieBannerProps) {
  const [visible, setVisible] = useState(false);
  const titleId = useId();
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => {
    setVisible(forceShow || getConsentStatus() === 'pending');
  }, [forceShow]);
  useEffect(() => () => cleanup.current?.(), []);
  const choose = (analytics: boolean) => {
    const value = { analytics };
    cleanup.current = updateTrackers(value);
    setConsentStatus(value);
    setVisible(false);
    onClose?.();
  };
  if (!visible) return null;
  return (
    <aside
      className="sp-cookie-banner"
      data-slot="cookie-banner"
      aria-labelledby={titleId}
    >
      <div className="sp-cookie-banner-content">
        <h3 className="sp-cookie-banner-title" id={titleId}>
          We value your privacy
        </h3>
        <p className="sp-cookie-banner-description">
          We use essential cookies and similar technologies to improve your
          browsing experience and analyze site traffic.{' '}
          <a
            className="sp-cookie-banner-link"
            href="https://kongmy.dev/privacy"
          >
            Privacy Policy
          </a>
        </p>
      </div>
      <div className="sp-cookie-banner-actions">
        <Button variant="outline" onClick={() => choose(false)}>
          Decline
        </Button>
        <Button onClick={() => choose(true)}>Accept</Button>
      </div>
    </aside>
  );
}
