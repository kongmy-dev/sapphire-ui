import { Button } from '../button/button.js';
import { SiteHeader, SiteHeaderLink } from './site-header.js';

function SiteHeaderDark() {
  return (
    <SiteHeader
      brand={<span>Sapphire</span>}
      nav={
        <>
          <SiteHeaderLink href="#overview" active>
            Overview
          </SiteHeaderLink>
          <SiteHeaderLink href="#documentation">Documentation</SiteHeaderLink>
        </>
      }
      actions={
        <Button variant="outline" asChild>
          <a href="#contact">Contact us</a>
        </Button>
      }
    />
  );
}
function SiteHeaderLight() {
  return (
    <SiteHeader
      variant="light"
      sticky={false}
      brand={<span>Sapphire</span>}
      nav={
        <>
          <SiteHeaderLink variant="light" href="#services" active>
            Services
          </SiteHeaderLink>
          <SiteHeaderLink variant="light" href="#about">
            About
          </SiteHeaderLink>
        </>
      }
    >
      <Button asChild>
        <a href="#start">Get started</a>
      </Button>
    </SiteHeader>
  );
}
export const examples = [
  { name: 'dark', render: SiteHeaderDark },
  { name: 'light', render: SiteHeaderLight },
] as const;
