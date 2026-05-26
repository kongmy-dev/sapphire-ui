// SiteFooter Web Component — framework-agnostic site footer with dark/light
// variants. Mirrors the React SiteFooter (src/components/ui/SiteFooter.tsx)
// so the visual result is identical.
//
// Usage (Astro / vanilla HTML):
//   <sapphire-site-footer variant="dark">
//     <div data-slot="brand">
//       <h4>BRAND</h4>
//       <p>Tagline goes here.</p>
//     </div>
//     <div data-slot="links">
//       <div>
//         <span>Product</span>
//         <a href="/features">Features</a>
//         <a href="/pricing">Pricing</a>
//       </div>
//     </div>
//     <div data-slot="bottom">
//       <span>© 2026 KONGMY DIGITAL SOLUTIONS</span>
//       <span>Built with Astro · Hosted on Cloudflare</span>
//     </div>
//   </sapphire-site-footer>
//
// Light DOM (no Shadow DOM); slotted content uses consumer Tailwind classes.

const SSRHTMLElement =
  typeof window !== 'undefined' ? HTMLElement : (class {} as typeof HTMLElement);

type FooterVariant = 'light' | 'dark';

const HOST_CLASSES_BASE = ['w-full', 'border-t'];
const HOST_CLASSES_DARK = ['border-border-dark', 'bg-primary', 'text-(--color-text-on-dark)'];
const HOST_CLASSES_LIGHT = ['border-border', 'bg-(--color-card-bg)', 'text-(--color-text-main)'];

const INNER_CLASSES = ['mx-auto', 'max-w-7xl', 'px-6', 'py-12', 'md:py-16'];

const ROW_CLASSES = ['mb-10', 'flex', 'flex-col', 'gap-10', 'md:flex-row', 'md:gap-16'];

const SLOT_BRAND_CLASSES = ['shrink-0', 'md:max-w-xs'];
const SLOT_LINKS_CLASSES = ['flex', 'flex-1', 'flex-wrap', 'gap-10', 'md:gap-16'];

const BOTTOM_CLASSES_BASE = [
  'flex',
  'flex-col',
  'items-center',
  'justify-between',
  'gap-4',
  'border-t',
  'pt-6',
  'font-mono',
  'text-[11px]',
  'tracking-[0.06em]',
  'uppercase',
  'md:flex-row',
];
const BOTTOM_CLASSES_DARK = ['border-border-dark', 'text-(--color-text-on-dark-muted)'];
const BOTTOM_CLASSES_LIGHT = ['border-border', 'text-(--color-text-muted)'];

export class SiteFooterElement extends SSRHTMLElement {
  static observedAttributes = ['variant'];

  private rendered = false;
  private slotCache: { brand: Node[]; links: Node[]; bottom: Node[]; extra: Node[] } = {
    brand: [],
    links: [],
    bottom: [],
    extra: [],
  };
  private bottomEl: HTMLElement | null = null;

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
    if (name === 'variant') {
      this.applyHostClasses();
      this.applyBottomVariant();
    }
  }

  private collectSlots() {
    const children = Array.from(this.childNodes);
    for (const node of children) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as HTMLElement;
      const slot = el.dataset.slot;
      if (slot === 'brand') this.slotCache.brand.push(el);
      else if (slot === 'links') this.slotCache.links.push(el);
      else if (slot === 'bottom') this.slotCache.bottom.push(el);
      else this.slotCache.extra.push(el);
    }
    while (this.firstChild) this.removeChild(this.firstChild);
  }

  private applyHostClasses() {
    const variant = (this.getAttribute('variant') || 'dark') as FooterVariant;

    this.classList.remove(...HOST_CLASSES_DARK, ...HOST_CLASSES_LIGHT);
    this.classList.add(...HOST_CLASSES_BASE);
    this.classList.add(...(variant === 'dark' ? HOST_CLASSES_DARK : HOST_CLASSES_LIGHT));

    this.setAttribute('role', this.getAttribute('role') || 'contentinfo');
  }

  private renderInner() {
    const inner = document.createElement('div');
    inner.classList.add(...INNER_CLASSES);

    const hasBrandOrLinks = this.slotCache.brand.length > 0 || this.slotCache.links.length > 0;
    if (hasBrandOrLinks) {
      const row = document.createElement('div');
      row.classList.add(...ROW_CLASSES);

      if (this.slotCache.brand.length > 0) {
        const brand = document.createElement('div');
        brand.classList.add(...SLOT_BRAND_CLASSES);
        brand.dataset.sapphireSlot = 'brand';
        this.slotCache.brand.forEach((n) => brand.appendChild(n));
        row.appendChild(brand);
      }
      if (this.slotCache.links.length > 0) {
        const links = document.createElement('div');
        links.classList.add(...SLOT_LINKS_CLASSES);
        links.dataset.sapphireSlot = 'links';
        this.slotCache.links.forEach((n) => links.appendChild(n));
        row.appendChild(links);
      }
      inner.appendChild(row);
    }

    if (this.slotCache.extra.length > 0) {
      this.slotCache.extra.forEach((n) => inner.appendChild(n));
    }

    if (this.slotCache.bottom.length > 0) {
      const bottom = document.createElement('div');
      bottom.dataset.sapphireSlot = 'bottom';
      this.slotCache.bottom.forEach((n) => bottom.appendChild(n));
      inner.appendChild(bottom);
      this.bottomEl = bottom;
      this.applyBottomVariant();
    }

    this.appendChild(inner);
  }

  private applyBottomVariant() {
    if (!this.bottomEl) return;
    const variant = (this.getAttribute('variant') || 'dark') as FooterVariant;
    this.bottomEl.classList.remove(...BOTTOM_CLASSES_DARK, ...BOTTOM_CLASSES_LIGHT);
    this.bottomEl.classList.add(...BOTTOM_CLASSES_BASE);
    this.bottomEl.classList.add(
      ...(variant === 'dark' ? BOTTOM_CLASSES_DARK : BOTTOM_CLASSES_LIGHT)
    );
  }
}

if (typeof window !== 'undefined' && !customElements.get('sapphire-site-footer')) {
  customElements.define('sapphire-site-footer', SiteFooterElement);
}
