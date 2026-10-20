'use client';

import { useRef } from 'react';
import { Button } from '../button/button.js';
import { Banner, type BannerRef, type BannerVariant } from './banner.js';

function BannerVariants() {
  const variants: BannerVariant[] = [
    'info',
    'success',
    'warning',
    'error',
    'brand',
  ];
  return (
    <div className="sp-stack">
      {variants.map((variant) => (
        <Banner key={variant} variant={variant} dismissible={false}>
          {variant}: Workspace announcement
        </Banner>
      ))}
    </div>
  );
}

function BannerDismissible() {
  const banner = useRef<BannerRef>(null);
  return (
    <div className="sp-stack">
      <Banner ref={banner}>
        New features are available.{' '}
        <a href="#release-notes">Read release notes</a>
      </Banner>
      <Button onClick={() => banner.current?.show()}>Show announcement</Button>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: BannerVariants },
  { name: 'dismissible', render: BannerDismissible },
] as const;
