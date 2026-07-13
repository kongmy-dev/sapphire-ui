import {
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
} from '../lib/consent';

const SSRHTMLElement =
  typeof window !== 'undefined'
    ? HTMLElement
    : (class {} as typeof HTMLElement);

export class CookieBannerElement extends SSRHTMLElement {
  private isRendered = false;
  private isVisible = false;
  private container: HTMLDivElement | null = null;
  private mountTimer: ReturnType<typeof setTimeout> | null = null;

  static get observedAttributes() {
    return ['force-show'];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    const status = getConsentStatus();
    const hasForceShow = this.hasAttribute('force-show');

    if (status === 'pending' || hasForceShow) {
      this.render();
    }
  }

  disconnectedCallback() {
    if (this.mountTimer) clearTimeout(this.mountTimer);
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (name === 'force-show') {
      if (newValue !== null) {
        // Attribute was added or set
        if (!this.isRendered) {
          this.render();
        } else if (!this.isVisible) {
          this.show();
        }
      } else {
        // Attribute was removed
        const status = getConsentStatus();
        if (status !== 'pending' && this.isVisible) {
          this.hide();
        }
      }
    }
  }

  public open() {
    if (!this.isRendered) {
      this.render();
    } else if (!this.isVisible) {
      this.show();
    }
  }

  private show() {
    if (!this.container) return;
    this.isVisible = true;

    // Force a reflow then flip transform — guarantees the transition fires
    // even when the element was just inserted (initial styles need to commit
    // to the layout tree before the transition target is set).
    void this.container.offsetHeight;
    this.mountTimer = setTimeout(() => {
      if (this.container) {
        this.container.style.transform = 'translateY(0)';
      }
    }, 20);
  }

  private hide() {
    if (!this.container) return;
    this.isVisible = false;
    this.container.style.transform = 'translateY(100%)';

    if (this.hasAttribute('force-show')) {
      this.removeAttribute('force-show');
    }

    setTimeout(() => {
      // If the attribute was re-added during transition, abort destruction
      if (this.isVisible) return;

      this.isRendered = false;
      this.innerHTML = '';
      this.container = null;
      this.dispatchEvent(new CustomEvent('close'));
    }, 350);
  }

  private handleAccept() {
    const prefs = { analytics: true };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    this.hide();
  }

  private handleDecline() {
    const prefs = { analytics: false };
    setConsentStatus(prefs);
    updateTrackers(prefs);
    this.hide();
  }

  private render() {
    this.isRendered = true;

    // Copy is attribute-driven so non-English sites can localize:
    // heading, description, privacy-url, privacy-label, accept-label,
    // decline-label. Text is injected via textContent (not innerHTML)
    // so attribute values cannot inject markup.
    const heading = this.getAttribute('heading') || 'We value your privacy';
    const description =
      this.getAttribute('description') ||
      'We use essential cookies and similar technologies to improve your browsing experience and analyze site traffic.';
    const privacyUrl =
      this.getAttribute('privacy-url') || 'https://kongmy.dev/privacy';
    const privacyLabel = this.getAttribute('privacy-label') || 'Privacy Policy';
    const acceptLabel = this.getAttribute('accept-label') || 'Accept';
    const declineLabel = this.getAttribute('decline-label') || 'Decline';

    this.innerHTML = `
      <div
        data-banner-container
        style="position:fixed;bottom:0;left:0;right:0;z-index:1000;transform:translateY(100%);transition:transform 300ms ease-in-out;"
        class="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 w-full bg-(--color-card-bg) border-t border-border shadow-[0_-4px_20px_rgba(10,25,47,0.12)]"
      >
        <div class="flex-1 max-w-4xl text-left">
          <h3 data-heading class="text-(--color-text-strong) font-serif font-semibold mb-1 text-[1.1rem]"></h3>
          <p class="text-(--color-text-muted) font-sans text-sm m-0 leading-relaxed">
            <span data-description></span> <a
              data-privacy-link
              class="text-accent underline underline-offset-2 hover:text-accent-dark transition-colors"
            ></a>
          </p>
        </div>
        <div class="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button
            data-decline-btn
            class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-(--color-text-strong) bg-surface border border-border hover:bg-border hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          ></button>
          <button
            data-accept-btn
            class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-(--color-text-on-dark) bg-primary border-b-2 border-accent hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(10,25,47,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          ></button>
        </div>
      </div>
    `;

    this.container = this.querySelector('[data-banner-container]');

    const headingEl = this.querySelector('[data-heading]');
    if (headingEl) headingEl.textContent = heading;
    const descriptionEl = this.querySelector('[data-description]');
    if (descriptionEl) descriptionEl.textContent = description;
    const privacyLink = this.querySelector<HTMLAnchorElement>(
      '[data-privacy-link]',
    );
    if (privacyLink) {
      privacyLink.href = privacyUrl;
      privacyLink.textContent = privacyLabel;
    }
    const acceptBtn = this.querySelector('[data-accept-btn]');
    if (acceptBtn) acceptBtn.textContent = acceptLabel;
    const declineBtn = this.querySelector('[data-decline-btn]');
    if (declineBtn) declineBtn.textContent = declineLabel;

    this.querySelector('[data-accept-btn]')?.addEventListener('click', () =>
      this.handleAccept(),
    );
    this.querySelector('[data-decline-btn]')?.addEventListener('click', () =>
      this.handleDecline(),
    );

    this.show();
  }
}

if (typeof window !== 'undefined' && !customElements.get('cookie-banner')) {
  customElements.define('cookie-banner', CookieBannerElement);
}
