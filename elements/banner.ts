const variants = ['info', 'success', 'warning', 'error', 'brand'] as const;
export type BannerVariant = (typeof variants)[number];

function bannerVariant(value: string | null): BannerVariant {
  return (
    variants.find((variant) => variant === value) ??
    (value === 'accent' ? 'brand' : 'info')
  );
}

function persistBanner(host: HTMLElement, hidden: boolean) {
  const key = host.getAttribute('storage-key');
  if (!key) return;
  try {
    const storage = host.ownerDocument.defaultView?.localStorage;
    if (hidden) storage?.setItem(`sapphire-banner:${key}`, '1');
    else storage?.removeItem(`sapphire-banner:${key}`);
  } catch {
    return;
  }
}

function createBannerElement() {
  return class BannerElement extends HTMLElement {
    constructor() {
      super();
      this.#connected = false;
    }
    static observedAttributes = [
      'variant',
      'dismissible',
      'dismiss-label',
      'storage-key',
      'hidden',
    ];
    #button: HTMLButtonElement | undefined;
    #connected: boolean;
    #dismiss = () => this.dismiss();

    connectedCallback() {
      this.#connected = true;
      this.classList.add('sp-banner');
      this.dataset.slot = 'banner';
      this.#readDismissed();
      this.#render();
    }

    disconnectedCallback() {
      this.#connected = false;
      this.#button?.removeEventListener('click', this.#dismiss);
    }

    attributeChangedCallback(name: string) {
      if (!this.#connected) return;
      if (name === 'storage-key') {
        this.hidden = false;
        this.#readDismissed();
      }
      this.#render();
    }

    dismiss() {
      persistBanner(this, true);
      this.hidden = true;
      this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true }));
    }

    show() {
      persistBanner(this, false);
      this.hidden = false;
    }

    #readDismissed() {
      const key = this.getAttribute('storage-key');
      if (!key) return;
      try {
        this.hidden =
          this.ownerDocument.defaultView?.localStorage.getItem(
            `sapphire-banner:${key}`,
          ) === '1';
      } catch {
        return;
      }
    }

    #render() {
      this.dataset.variant = bannerVariant(this.getAttribute('variant'));
      if (!this.hasAttribute('dismissible')) {
        this.#button?.removeEventListener('click', this.#dismiss);
        this.#button?.remove();
        this.#button = undefined;
        return;
      }
      if (!this.#button) {
        this.#button = this.ownerDocument.createElement('button');
        this.#button.type = 'button';
        this.#button.className = 'sp-banner-dismiss';
        this.#button.dataset.sapphireBannerDismiss = '';
        this.#button.innerHTML =
          '<svg class="sp-icon" viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>';
        this.append(this.#button);
      }
      this.#button.setAttribute(
        'aria-label',
        this.getAttribute('dismiss-label') || 'Dismiss',
      );
      this.#button.addEventListener('click', this.#dismiss);
    }
  };
}

export const BannerElement =
  typeof HTMLElement === 'undefined' ? undefined : createBannerElement();
export type BannerElement = InstanceType<NonNullable<typeof BannerElement>>;
if (BannerElement && !customElements.get('sapphire-banner'))
  customElements.define('sapphire-banner', BannerElement);
