import React, { useEffect, useRef } from 'react';
import './CookieBannerElement';

export interface CookieBannerProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function CookieBanner({ forceShow, onClose }: CookieBannerProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (forceShow) {
      el.setAttribute('force-show', '');
    } else {
      el.removeAttribute('force-show');
    }
  }, [forceShow]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleClose = () => {
      if (onClose) onClose();
    };

    el.addEventListener('close', handleClose);
    return () => {
      el.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  // Using React.createElement dynamically avoids needing JSX custom element declarations,
  // completely bypassing the need for namespaces and ESLint rules.
  return React.createElement('cookie-banner', { ref });
}
