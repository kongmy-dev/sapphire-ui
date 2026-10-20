import {
  appendElementSlot,
  collectElementSlots,
} from '../lib/element-slots.js';

function appendFooterGrid(inner: HTMLElement, slots: Map<string, Node[]>) {
  if (!slots.has('brand') && !slots.has('links')) return;
  const grid = appendElementSlot(inner, {
    nodes: [],
    className: 'sp-site-footer-grid',
  });
  for (const slot of ['brand', 'links']) {
    const nodes = slots.get(slot);
    if (nodes?.length)
      appendElementSlot(grid, {
        nodes,
        className: `sp-site-footer-${slot}`,
        slot,
      });
  }
}

function renderFooter(host: HTMLElement) {
  const slots = collectElementSlots(host);
  const inner = appendElementSlot(host, {
    nodes: [],
    className: 'sp-site-footer-inner',
  });
  appendFooterGrid(inner, slots);
  for (const [slot, nodes] of slots) {
    if (!['brand', 'links', 'bottom'].includes(slot)) inner.append(...nodes);
  }
  const bottom = slots.get('bottom');
  if (bottom?.length)
    appendElementSlot(inner, {
      nodes: bottom,
      className: 'sp-site-footer-bottom',
      slot: 'bottom',
    });
}

type SiteFooterConstructor = {
  new (): HTMLElement & {
    connectedCallback(): void;
    attributeChangedCallback(): void;
  };
  observedAttributes: string[];
};

function createSiteFooterElement(): SiteFooterConstructor {
  return class SiteFooterElement extends HTMLElement {
    constructor() {
      super();
      this.#rendered = false;
    }
    static observedAttributes = ['variant'];
    #rendered: boolean;

    connectedCallback() {
      this.classList.add('sp-site-footer');
      this.dataset.slot = 'site-footer';
      if (!this.hasAttribute('role')) this.setAttribute('role', 'contentinfo');
      this.attributeChangedCallback();
      if (this.#rendered) return;
      renderFooter(this);
      this.#rendered = true;
    }

    attributeChangedCallback() {
      this.dataset.variant =
        this.getAttribute('variant') === 'light' ? 'light' : 'dark';
    }
  };
}

export const SiteFooterElement =
  typeof HTMLElement === 'undefined' ? undefined : createSiteFooterElement();
export type SiteFooterElement = InstanceType<
  NonNullable<typeof SiteFooterElement>
>;
if (SiteFooterElement && !customElements.get('sapphire-site-footer'))
  customElements.define('sapphire-site-footer', SiteFooterElement);
