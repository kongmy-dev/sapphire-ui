import {
  appendElementSlot,
  collectElementSlots,
} from '../lib/element-slots.js';

function appendHeaderSlot(
  inner: HTMLElement,
  [slot, nodes]: readonly [string, readonly Node[]],
) {
  const first = nodes[0];
  if (
    slot === 'nav' &&
    nodes.length === 1 &&
    first instanceof HTMLElement &&
    first.tagName === 'NAV'
  ) {
    first.classList.add('sp-site-header-nav');
    first.dataset.sapphireSlot = slot;
    inner.append(first);
  } else
    appendElementSlot(inner, {
      nodes,
      className: `sp-site-header-${slot}`,
      slot,
      tag: slot === 'nav' ? 'nav' : 'div',
    });
}

function renderHeader(host: HTMLElement) {
  const slots = collectElementSlots(host);
  const inner = appendElementSlot(host, {
    nodes: [],
    className: 'sp-site-header-inner',
  });
  for (const slot of ['brand', 'nav', 'actions']) {
    const nodes = slots.get(slot);
    if (!nodes?.length) continue;
    appendHeaderSlot(inner, [slot, nodes]);
  }
  for (const [slot, nodes] of slots) {
    if (!['brand', 'nav', 'actions'].includes(slot)) inner.append(...nodes);
  }
}

type SiteHeaderConstructor = {
  new (): HTMLElement & {
    connectedCallback(): void;
    attributeChangedCallback(): void;
  };
  observedAttributes: string[];
};

function createSiteHeaderElement(): SiteHeaderConstructor {
  return class SiteHeaderElement extends HTMLElement {
    constructor() {
      super();
      this.#rendered = false;
    }
    static observedAttributes = ['variant', 'sticky'];
    #rendered: boolean;

    connectedCallback() {
      this.classList.add('sp-site-header');
      this.dataset.slot = 'site-header';
      if (!this.hasAttribute('role')) this.setAttribute('role', 'banner');
      this.attributeChangedCallback();
      if (this.#rendered) return;
      renderHeader(this);
      this.#rendered = true;
    }

    attributeChangedCallback() {
      this.dataset.variant =
        this.getAttribute('variant') === 'light' ? 'light' : 'dark';
      if (this.hasAttribute('sticky')) this.dataset.sticky = 'true';
      else delete this.dataset.sticky;
    }
  };
}

export const SiteHeaderElement =
  typeof HTMLElement === 'undefined' ? undefined : createSiteHeaderElement();
export type SiteHeaderElement = InstanceType<
  NonNullable<typeof SiteHeaderElement>
>;
if (SiteHeaderElement && !customElements.get('sapphire-site-header'))
  customElements.define('sapphire-site-header', SiteHeaderElement);
