import { SiteHeaderElement } from './site-header.js';

function Navigation() {
  if (!SiteHeaderElement) throw new Error('Browser required');
  const header = new SiteHeaderElement();
  header.setAttribute('sticky', '');
  header.innerHTML =
    '<a data-slot="brand" href="#home">SAPPHIRE</a><nav data-slot="nav" aria-label="Main"><a class="sp-site-header-link" href="#features">Features</a><a class="sp-site-header-link" href="#pricing">Pricing</a></nav><a class="sp-button" data-slot="actions" href="#contact">Contact</a>';
  return header;
}

export const examples = [{ name: 'navigation', render: Navigation }] as const;
