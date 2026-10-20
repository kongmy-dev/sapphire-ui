'use client';

import { useState } from 'react';
import { Breadcrumb } from './breadcrumb.js';

function BreadcrumbTrail() {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Components', href: '#components' },
        { label: 'Breadcrumb' },
      ]}
    />
  );
}

function BreadcrumbNavigation() {
  const [destination, setDestination] = useState('None');
  return (
    <>
      <Breadcrumb
        aria-label="Project trail"
        separator="›"
        items={[
          { label: 'Projects', href: '#projects' },
          { label: 'Workspace' },
          { label: 'Settings' },
        ]}
        onNavigate={(href, event) => {
          event.preventDefault();
          setDestination(href);
        }}
      />
      <output>Destination: {destination}</output>
    </>
  );
}

export const examples = [
  { name: 'trail', render: BreadcrumbTrail },
  { name: 'navigation', render: BreadcrumbNavigation },
] as const;
