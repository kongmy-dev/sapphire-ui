import { SiteFooterElement } from './site-footer.js';

function Navigation() {
  if (!SiteFooterElement) throw new Error('Browser required');
  const footer = new SiteFooterElement();
  footer.innerHTML =
    '<div data-slot="brand">SAPPHIRE</div><nav data-slot="links" aria-label="Footer"><a class="sp-site-footer-link" href="#privacy">Privacy</a><a class="sp-site-footer-link" href="#terms">Terms</a></nav><span data-slot="bottom">© Sapphire</span>';
  return footer;
}

export const examples = [{ name: 'navigation', render: Navigation }] as const;
