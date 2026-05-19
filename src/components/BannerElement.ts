// Banner Web Component — dismissible top-of-page callout with optional
// localStorage persistence so dismissals stick across sessions/pages.
// Framework-agnostic; pair with the React wrapper in Banner.tsx.

const SSRHTMLElement = typeof window !== 'undefined' ? HTMLElement : class {} as typeof HTMLElement;

export type BannerVariant = 'info' | 'success' | 'warning' | 'error' | 'accent';

const STORAGE_PREFIX = 'sapphire-banner:';

export class BannerElement extends SSRHTMLElement {
  static observedAttributes = ['variant', 'dismissible', 'storage-key', 'hidden'];

  private rendered = false;

  connectedCallback() {
    if (typeof window === 'undefined') return;

    // If a storage-key is set and the user previously dismissed, stay hidden.
    const storageKey = this.getAttribute('storage-key');
    if (storageKey && this.isDismissed(storageKey)) {
      this.setAttribute('hidden', '');
      return;
    }

    this.render();
  }

  attributeChangedCallback(name: string) {
    if (!this.rendered) return;
    if (name === 'variant') this.render();
    if (name === 'hidden' && this.hasAttribute('hidden')) {
      // Allow external hide() via attribute.
      this.style.display = 'none';
    }
  }

  /** Dismiss the banner — fires `dismiss` event and persists if storage-key set. */
  public dismiss() {
    const storageKey = this.getAttribute('storage-key');
    if (storageKey) this.persistDismissed(storageKey);
    this.setAttribute('hidden', '');
    this.style.display = 'none';
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
  }

  /** Show the banner programmatically (clears the hidden attribute). */
  public show() {
    this.removeAttribute('hidden');
    this.style.display = '';
  }

  private isDismissed(key: string): boolean {
    try {
      return window.localStorage.getItem(STORAGE_PREFIX + key) === '1';
    } catch {
      return false;
    }
  }

  private persistDismissed(key: string) {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, '1');
    } catch {
      // Storage unavailable (privacy mode, quota); silently no-op.
    }
  }

  private render() {
    const variant = (this.getAttribute('variant') || 'info') as BannerVariant;
    const dismissible = this.hasAttribute('dismissible');

    // The host element gets the variant data-attribute; CSS rules in
    // index.css drive the actual colors. Children are slotted via
    // light-DOM children — consumers populate the message themselves.
    this.setAttribute('data-variant', variant);
    this.classList.add('sapphire-banner');

    // Add the dismiss button if requested and not already there.
    if (dismissible && !this.querySelector('[data-sapphire-banner-dismiss]')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Dismiss');
      btn.setAttribute('data-sapphire-banner-dismiss', '');
      btn.className = 'sapphire-banner-dismiss';
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>';
      btn.addEventListener('click', () => this.dismiss());
      this.appendChild(btn);
    }

    this.rendered = true;
  }
}

if (typeof window !== 'undefined' && !customElements.get('sapphire-banner')) {
  customElements.define('sapphire-banner', BannerElement);
}
