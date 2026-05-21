import { getConsentStatus, setConsentStatus, updateTrackers } from '../lib/consent';

const SSRHTMLElement = typeof window !== 'undefined' ? HTMLElement : class {} as typeof HTMLElement;

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

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
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
    
    // Trigger transition by adding class in next tick
    this.mountTimer = setTimeout(() => {
      if (this.container) {
        this.container.classList.add('is-visible');
      }
    }, 50);
  }

  private hide() {
    if (!this.container) return;
    this.isVisible = false;
    this.container.classList.remove('is-visible');

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
    this.innerHTML = `
      <div
        data-banner-container
        class="sapphire-cookie-banner flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 gap-4 w-full bg-(--color-card-bg) border-t border-border shadow-[0_-4px_20px_rgba(10,25,47,0.12)]"
      >
        <div class="flex-1 max-w-4xl text-left">
          <h3 class="text-(--color-text-strong) font-serif font-semibold mb-1 text-[1.1rem]">
            We value your privacy
          </h3>
          <p class="text-(--color-text-muted) font-sans text-sm m-0 leading-relaxed">
            We use essential cookies and similar technologies to improve your browsing experience and
            analyze site traffic. Read our <a
              href="https://kongmy.dev/privacy"
              class="text-accent underline underline-offset-2 hover:text-accent-dark transition-colors"
            >Privacy Policy</a> to learn more.
          </p>
        </div>
        <div class="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto shrink-0 justify-end">
          <button
            data-decline-btn
            class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-(--color-text-strong) bg-surface border border-border hover:bg-border hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Decline
          </button>
          <button
            data-accept-btn
            class="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-md transition-all cursor-pointer font-sans text-center text-white bg-primary border-b-2 border-accent hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(10,25,47,0.1)] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Accept
          </button>
        </div>
      </div>
    `;

    this.container = this.querySelector('[data-banner-container]');
    
    this.querySelector('[data-accept-btn]')?.addEventListener('click', () => this.handleAccept());
    this.querySelector('[data-decline-btn]')?.addEventListener('click', () => this.handleDecline());

    this.show();
  }
}

if (typeof window !== 'undefined' && !customElements.get('cookie-banner')) {
  customElements.define('cookie-banner', CookieBannerElement);
}
