import { SiteFooter, SiteFooterGroup, SiteFooterLink } from './site-footer.js';

function SiteFooterDark() {
  return (
    <SiteFooter
      brand={<span>Sapphire</span>}
      links={
        <SiteFooterGroup title="Resources">
          <SiteFooterLink href="#guide">Guide</SiteFooterLink>
          <SiteFooterLink href="#support">Support</SiteFooterLink>
        </SiteFooterGroup>
      }
      bottom={<span>© Sapphire</span>}
    >
      <p className="docs-footer-brand-text">Made for coherent experiences.</p>
    </SiteFooter>
  );
}
function SiteFooterLight() {
  return (
    <SiteFooter
      variant="light"
      links={
        <SiteFooterGroup title="Company">
          <SiteFooterLink variant="light" href="#company">
            About the company
          </SiteFooterLink>
        </SiteFooterGroup>
      }
      bottom={
        <SiteFooterLink variant="light" href="#privacy">
          Privacy
        </SiteFooterLink>
      }
    />
  );
}
export const examples = [
  { name: 'dark', render: SiteFooterDark },
  { name: 'light', render: SiteFooterLight },
] as const;
