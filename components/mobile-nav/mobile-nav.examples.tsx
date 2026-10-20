'use client';

import { useState } from 'react';
import { Container } from '../container/container.js';
import { MobileNav, type MobileNavItem } from './mobile-nav.js';

function MobileNavLinks() {
  return (
    <MobileNav
      brandName="Sapphire"
      brandSuffix="UI"
      version="v4"
      pathname="/overview"
      navItems={
        [
          {
            href: '/overview',
            label: 'Overview',
            icon: (
              <svg
                aria-hidden="true"
                className="sp-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 10 9-7 9 7v11H3Z" />
              </svg>
            ),
          },
          { href: '#mobile-guide', label: 'Guide' },
        ] satisfies readonly MobileNavItem[]
      }
      extraActions={
        <form onSubmit={(event) => event.preventDefault()}>
          <label>
            Search navigation
            <input type="search" className="sp-input" data-variant="on-dark" />
          </label>
          <button
            type="submit"
            className="sp-button"
            data-variant="on-dark-outline"
          >
            Search
          </button>
        </form>
      }
    />
  );
}
function MobileNavRouter() {
  const [pathname, setPathname] = useState('/projects');
  return (
    <>
      <MobileNav
        brandName="Workspace"
        pathname={pathname}
        navItems={[
          { href: '/projects', label: 'Projects' },
          {
            href: '/settings',
            label: 'Settings',
            active: pathname === '/settings',
          },
        ]}
        toggleLabel="Open workspace navigation"
        closeLabel="Close workspace navigation"
        onNavigate={(href, event) => {
          event.preventDefault();
          setPathname(href);
        }}
      />
      <Container padding="lg">
        <output>Current route: {pathname}</output>
      </Container>
    </>
  );
}
export const examples = [
  { name: 'links', render: MobileNavLinks },
  { name: 'router', render: MobileNavRouter },
] as const;
