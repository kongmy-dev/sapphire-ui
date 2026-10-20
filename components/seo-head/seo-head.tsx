import { createElement, type ReactNode } from 'react';
import { metadata } from './metadata.js';
import type { SEOOptions } from './seo-types.js';

export { generateSEOTags } from './seo-tags.js';
export type SEOProps = SEOOptions & { children?: ReactNode };

export function SEOHead({ children, ...props }: SEOProps) {
  return (
    <>
      {metadata(props).map(({ tag, attrs, text }, key) =>
        tag === 'script'
          ? createElement(tag, {
              ...attrs,
              key,
              dangerouslySetInnerHTML: { __html: text ?? '' },
            })
          : createElement(tag, { ...attrs, key }, text),
      )}
      {children}
    </>
  );
}
