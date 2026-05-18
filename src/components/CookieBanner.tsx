import { useState, useEffect } from 'react';
import { getConsentStatus, setConsentStatus, updateTrackers } from '../lib/consent';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (status === 'pending') {
      setIsRendered(true);
      // Slight delay for animation entry
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    }
  }, []);

  const handleAccept = () => {
    const prefs = { analytics: true };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 300);
  };

  const handleDecline = () => {
    const prefs = { analytics: false };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    setIsVisible(false);
    setTimeout(() => setIsRendered(false), 300);
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[1000] w-full bg-white border-t border-[var(--color-border)] shadow-[0_-4px_20px_rgba(10,25,47,0.12)] transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
        <div className="flex-1 max-w-4xl text-left">
          <h3 className="text-[var(--color-primary)] font-serif font-semibold mb-1 text-[1.1rem]">
            We value your privacy
          </h3>
          <p className="text-[var(--color-text-muted)] font-sans text-sm m-0 leading-relaxed">
            We use essential cookies and similar technologies to improve your browsing experience and
            analyze site traffic. Read our{' '}
            <a
              href="https://kongmy.dev/privacy"
              className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-accent-dark)] transition-colors"
            >
              Privacy Policy
            </a>{' '}
            to learn more.
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button
            onClick={handleDecline}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-[var(--color-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-white bg-[var(--color-primary)] border-b-2 border-[var(--color-accent)] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(10,25,47,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
