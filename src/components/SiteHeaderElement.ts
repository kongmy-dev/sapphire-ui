// SiteHeader Web Component — framework-agnostic site header with optional
// sticky positioning and dark/light variants. Mirrors the React SiteHeader
// (src/components/ui/SiteHeader.tsx) so the visual result is identical.
//
// Usage (Astro / vanilla HTML):
//   <sapphire-site-header variant="dark" sticky>
//     <div data-slot="brand">
//       <span>BRAND</span>
//     </div>
//     <nav data-slot="nav">
//       <a href="#features">Features</a>
//       <a href="#pricing">Pricing</a>
//     </nav>
//     <div data-slot="actions">
//       <a href="/download">Download</a>
//     </div>
//   </sapphire-site-header>
//
// All children without a `data-slot` are treated as free-form and appended
// after the actions slot. Light DOM (no Shadow DOM) so consumer Tailwind
// utilities apply normally to slotted content.

const SSRHTMLElement =
  typeof window !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement);

type HeaderVariant = 'light' | 'dark';

const HOST_CLASSES_BASE = ['z-40', 'w-full', 'border-b'];
const HOST_CLASSES_STICKY = ['sticky', 'top-0'];
// Match SiteHeader.tsx exactly so the compiled Tailwind output is reused.
const HOST_CLASSES_DARK = ['border-border-dark', 'bg-primary', 'text-(--color-text-on-dark)'];
const HOST_CLASSES_LIGHT = ['border-border', 'bg-(--color-card-bg)', 'text-(--color-text-strong)'];

const INNER_CLASSES = [
  'mx-auto',
  'flex',
  'h-16',
  'max-w-7xl',
  'items-center',
  'justify-between',
  'gap-6',
  'px-6',
];

const SLOT_BRAND_CLASSES = ['flex', 'shrink-0', 'items-center', 'gap-3'];
const SLOT_NAV_CLASSES = ['hidden', 'flex-1', 'items-center', 'gap-1', 'md:flex'];
const SLOT_ACTIONS_CLASSES = ['flex', 'shrink-0', 'items-center', 'gap-3'];

export class SiteHeaderElement extends SSRHTMLElement {
  static observedAttributes = ['variant', 'sticky'];

  private rendered = false;
  /** Holds detached slot nodes so attribute changes can re-flow them. */
  private slotCache: { brand: Node[]; nav: Node[]; actions: Node[]; extra: Node[] } = {
    brand: [],
    nav: [],
    actions: [],
    extra: [],
  };

  connectedCallback() {
    if (typeof window === 'undefined') return;
    if (this.rendered) return;
    this.collectSlots();
    this.applyHostClasses();
    this.renderInner();
    this.rendered = true;
  }

  attributeChangedCallback(name: string) {
    if (!this.rendered) return;
    if (name === 'variant' || name === 'sticky') this.applyHostClasses();
  }

  /** Read children with `data-slot` attributes into the cache. */
  private collectSlots() {
    const children = Array.from(this.childNodes);
    for (const node of children) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as HTMLElement;
      const slot = el.dataset.slot;
      if (slot === 'brand') this.slotCache.brand.push(el);
      else if (slot === 'nav') this.slotCache.nav.push(el);
      else if (slot === 'actions') this.slotCache.actions.push(el);
      else this.slotCache.extra.push(el);
    }
    // Detach all original children — we'll re-mount them inside the wrapper.
    while (this.firstChild) this.removeChild(this.firstChild);
  }

  private applyHostClasses() {
    const variant = (this.getAttribute('variant') || 'dark') as HeaderVariant;
    const sticky = this.hasAttribute('sticky');

    // Remove any previously-applied variant classes before re-applying.
    this.classList.remove(
      ...HOST_CLASSES_DARK,
      ...HOST_CLASSES_LIGHT,
      ...HOST_CLASSES_STICKY
    );
    this.classList.add(...HOST_CLASSES_BASE);
    if (sticky) this.classList.add(...HOST_CLASSES_STICKY);
    this.classList.add(...(variant === 'dark' ? HOST_CLASSES_DARK : HOST_CLASSES_LIGHT));

    // Element semantic for assistive tech: behave as a banner landmark.
    this.setAttribute('role', this.getAttribute('role') || 'banner');
  }

  private renderInner() {
    const inner = document.createElement('div');
    inner.classList.add(...INNER_CLASSES);

    if (this.slotCache.brand.length > 0) {
      const brand = document.createElement('div');
      brand.classList.add(...SLOT_BRAND_CLASSES);
      brand.dataset.sapphireSlot = 'brand';
      this.slotCache.brand.forEach((n) => brand.appendChild(n));
      inner.appendChild(brand);
    }

    if (this.slotCache.nav.length > 0) {
      // If the user already passed a <nav>, use it as the container.
      const navHost =
        this.slotCache.nav.length === 1 &&
        (this.slotCache.nav[0] as HTMLElement).tagName === 'NAV'
          ? (this.slotCache.nav[0] as HTMLElement)
          : (() => {
              const n = document.createElement('nav');
              this.slotCache.nav.forEach((node) => n.appendChild(node));
              return n;
            })();
      navHost.classList.add(...SLOT_NAV_CLASSES);
      navHost.dataset.sapphireSlot = 'nav';
      inner.appendChild(navHost);
    }

    if (this.slotCache.actions.length > 0) {
      const actions = document.createElement('div');
      actions.classList.add(...SLOT_ACTIONS_CLASSES);
      actions.dataset.sapphireSlot = 'actions';
      this.slotCache.actions.forEach((n) => actions.appendChild(n));
      inner.appendChild(actions);
    }

    if (this.slotCache.extra.length > 0) {
      this.slotCache.extra.forEach((n) => inner.appendChild(n));
    }

    this.appendChild(inner);
  }
}

if (typeof window !== 'undefined' && !customElements.get('sapphire-site-header')) {
  customElements.define('sapphire-site-header', SiteHeaderElement);
}
