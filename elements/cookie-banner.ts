import {
  CONSENT_CHANGE_EVENT,
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
} from '../lib/consent.js';

const copy = {
  heading: 'We value your privacy',
  description:
    'We use essential cookies and similar technologies to improve your browsing experience and analyze site traffic.',
  'privacy-url': 'https://kongmy.dev/privacy',
  'privacy-label': 'Privacy Policy',
  'accept-label': 'Accept',
  'decline-label': 'Decline',
} as const;

function text(element: Element, name: keyof typeof copy) {
  return element.getAttribute(name) || copy[name];
}

function contentOf(element: Element) {
  const content = document.createElement('div');
  content.className = 'sp-cookie-banner-content';
  const title = document.createElement('h3');
  title.className = 'sp-cookie-banner-title';
  title.id = `cookie-banner-${crypto.randomUUID()}`;
  title.textContent = text(element, 'heading');
  const description = document.createElement('p');
  description.className = 'sp-cookie-banner-description';
  const link = document.createElement('a');
  link.className = 'sp-cookie-banner-link';
  link.href = text(element, 'privacy-url');
  link.textContent = text(element, 'privacy-label');
  description.append(`${text(element, 'description')} `, link);
  content.append(title, description);
  return { content, title };
}

function actionsOf(element: Element, choose: (analytics: boolean) => void) {
  const actions = document.createElement('div');
  actions.className = 'sp-cookie-banner-actions';
  for (const analytics of [false, true]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sp-button';
    button.dataset.slot = 'button';
    button.dataset.variant = analytics ? 'primary' : 'outline';
    button.dataset.size = 'default';
    button.textContent = text(
      element,
      analytics ? 'accept-label' : 'decline-label',
    );
    button.addEventListener('click', () => choose(analytics));
    actions.append(button);
  }
  return actions;
}

function createCookieBannerElement() {
  return class CookieBannerElement extends HTMLElement {
    static observedAttributes = ['force-show', ...Object.keys(copy)];
    #container: HTMLElement | undefined;
    #closeTimer: ReturnType<typeof setTimeout> | undefined;
    #cleanup: (() => void) | undefined;
    #requested: boolean;

    constructor() {
      super();
      this.#requested = false;
    }
    #sync = () => {
      const visible =
        this.#requested ||
        this.hasAttribute('force-show') ||
        getConsentStatus() === 'pending';
      if (visible) this.#render();
      else this.#hide();
    };

    connectedCallback() {
      document.addEventListener(CONSENT_CHANGE_EVENT, this.#sync);
      this.#sync();
    }

    disconnectedCallback() {
      document.removeEventListener(CONSENT_CHANGE_EVENT, this.#sync);
      clearTimeout(this.#closeTimer);
      this.#cleanup?.();
      this.#cleanup = undefined;
      this.#container?.remove();
      this.#container = undefined;
    }

    attributeChangedCallback(name: string) {
      if (!this.isConnected) return;
      if (name !== 'force-show') {
        this.#container?.remove();
        this.#container = undefined;
      }
      this.#sync();
    }

    open() {
      this.#requested = true;
      if (this.isConnected) this.#render();
    }

    #render() {
      clearTimeout(this.#closeTimer);
      if (this.#container) return;
      const aside = document.createElement('aside');
      aside.className = 'sp-cookie-banner';
      aside.dataset.slot = 'cookie-banner';
      const { content, title } = contentOf(this);
      aside.setAttribute('aria-labelledby', title.id);
      aside.append(content, actionsOf(this, this.#choose.bind(this)));
      this.append(aside);
      this.#container = aside;
    }

    #hide() {
      if (!this.#container) return;
      this.#container.remove();
      this.#container = undefined;
      this.#closeTimer = setTimeout(
        () => this.dispatchEvent(new CustomEvent('close')),
        350,
      );
    }

    #choose(analytics: boolean) {
      this.#requested = false;
      this.#cleanup?.();
      this.#cleanup = updateTrackers({ analytics });
      setConsentStatus({ analytics });
      this.removeAttribute('force-show');
      this.#hide();
    }
  };
}

export const CookieBannerElement =
  typeof HTMLElement === 'undefined' ? undefined : createCookieBannerElement();
export type CookieBannerElement = InstanceType<
  NonNullable<typeof CookieBannerElement>
>;

if (CookieBannerElement && !customElements.get('cookie-banner'))
  customElements.define('cookie-banner', CookieBannerElement);
