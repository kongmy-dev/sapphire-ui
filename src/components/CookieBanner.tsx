import { useState, useEffect } from 'react';
import { getConsentStatus, setConsentStatus, updateTrackers } from '../lib/consent';

export interface CookieBannerProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function CookieBanner({ forceShow, onClose }: CookieBannerProps) {
  const [isRendered, setIsRendered] = useState(() => {
    return getConsentStatus() === 'pending' || !!forceShow;
  });
  const [isVisible, setIsVisible] = useState(false);

  // Sync prop changes during render to ensure DOM element exists before transition
  if (forceShow && !isRendered) {
    setIsRendered(true);
  }

  // 1. Mount animation effect: transition to visible
  useEffect(() => {
    if (isRendered) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isRendered]);

  // 2. Parent-triggered close effect: transition to invisible and unmount
  useEffect(() => {
    if (!forceShow && isRendered && isVisible && getConsentStatus() !== 'pending') {
      const timer1 = setTimeout(() => {
        setIsVisible(false);
      }, 0);
      const timer2 = setTimeout(() => {
        setIsRendered(false);
      }, 350);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [forceShow, isRendered, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      if (onClose) onClose();
    }, 350);
  };

  const handleAccept = () => {
    const prefs = { analytics: true };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    handleClose();
  };

  const handleDecline = () => {
    const prefs = { analytics: false };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    handleClose();
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-1000 flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 w-full bg-white border-t border-border shadow-[0_-4px_20px_rgba(10,25,47,0.12)] transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex-1 max-w-4xl text-left">
        <h3 className="text-primary font-serif font-semibold mb-1 text-[1.1rem]">
          We value your privacy
        </h3>
        <p className="text-(--color-text-muted) font-sans text-sm m-0 leading-relaxed">
          We use essential cookies and similar technologies to improve your browsing experience and
          analyze site traffic. Read our{' '}
          <a
            href="https://kongmy.dev/privacy"
            className="text-accent underline underline-offset-2 hover:text-accent-dark transition-colors"
          >
            Privacy Policy
          </a>{' '}
          to learn more.
        </p>
      </div>
      <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto shrink-0 justify-end">
        <button
          onClick={handleDecline}
          className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-primary bg-surface border border-border hover:bg-border hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-white bg-primary border-b-2 border-accent hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(10,25,47,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
