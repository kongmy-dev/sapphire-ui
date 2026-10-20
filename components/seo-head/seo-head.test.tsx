import { expect, test } from 'bun:test';
import { render } from '@testing-library/react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { examples } from './seo-head.examples.js';
import { generateSEOTags, SEOHead, type SEOProps } from './seo-head.js';

function parsedHTML(html: string) {
  return new DOMParser().parseFromString(
    `<html><head>${html}</head><body></body></html>`,
    'text/html',
  );
}

const rich: SEOProps = {
  title: 'A <title> & "quote"',
  description: 'A description',
  url: 'https://example.com/a?x=1&y=2',
  image: 'https://example.com/image.jpg',
  siteName: 'Example',
  type: 'article',
  locale: 'en_MY',
  hreflang: { en: 'https://example.com' },
  preconnect: ['https://fonts.example.com'],
  preload: [
    { href: '/font.woff2', as: 'font', type: 'font/woff2', crossOrigin: '' },
    { href: '/photo.jpg', as: 'image' },
  ],
  isOrganization: true,
  isWebSite: true,
  twitterCard: 'summary',
  twitterSite: '@example',
  publishedTime: '2026-01-01',
  author: 'Editor',
  keywords: ['design', 'systems'],
  robots: 'noindex',
  jsonLd: {
    '@type': 'Article',
    headline: '</script><script>alert(1)</script>',
  },
};

test('React and raw HTML render the same metadata and safe structured data', () => {
  const raw = parsedHTML(generateSEOTags(rich));
  const react = parsedHTML(
    renderToStaticMarkup(
      <SEOHead {...rich}>
        <meta name="extra" content="child" />
      </SEOHead>,
    ),
  );
  expect(raw.title).toBe(rich.title);
  for (const element of Array.from(raw.head.children)) {
    const matching = Array.from(react.head.children).find(
      (candidate) =>
        candidate.tagName === element.tagName &&
        candidate.textContent === element.textContent &&
        Array.from(element.attributes).every(
          (attr) => candidate.getAttribute(attr.name) === attr.value,
        ),
    );
    expect(matching).toBeDefined();
  }
  expect(
    react.querySelector('meta[name="extra"]')?.getAttribute('content'),
  ).toBe('child');
  expect(raw.querySelectorAll('script')).toHaveLength(3);
  const scripts = Array.from(raw.querySelectorAll('script'));
  expect(
    scripts.map((script) => JSON.parse(script.textContent ?? '')),
  ).toContainEqual(rich.jsonLd);
  expect(generateSEOTags(rich)).not.toContain('</script><script>');
  expect(
    raw.querySelector('link[rel="preload"]')?.getAttribute('crossorigin'),
  ).toBe('');
});

test('default and minimal organization schemas retain legacy defaults', () => {
  const base = {
    title: 'Title',
    description: 'Description',
    isOrganization: true,
    isWebSite: true,
  };
  const defaultDoc = parsedHTML(generateSEOTags(base));
  expect(
    defaultDoc.querySelector('meta[name="robots"]')?.getAttribute('content'),
  ).toBe('index, follow');
  expect(
    defaultDoc
      .querySelector('meta[property="og:type"]')
      ?.getAttribute('content'),
  ).toBe('website');
  expect(
    JSON.parse(defaultDoc.querySelector('script')?.textContent ?? ''),
  ).toMatchObject({
    name: 'KONGMY',
    url: 'https://kongmy.dev',
    image: 'https://kongmy.dev/Logo_Full.webp',
  });
  const minimal = parsedHTML(
    generateSEOTags({
      ...base,
      omitDefaultOrganizationDetails: true,
      siteName: '',
      robots: '',
      keywords: [],
    }),
  );
  expect(
    JSON.parse(minimal.querySelector('script')?.textContent ?? ''),
  ).toEqual({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '',
    url: 'https://sapphire.kongmy.dev',
  });
  expect(minimal.querySelector('meta[name="robots"]')).toBeNull();
  const fallback = parsedHTML(generateSEOTags({ ...base, siteName: '' }));
  expect(
    JSON.parse(fallback.querySelector('script')?.textContent ?? '').name,
  ).toBe('KONGMY Digital Solutions');
});

test('raw metadata escapes attributes and rejects unserializable structured data', () => {
  const result = parsedHTML(
    generateSEOTags({
      title: 'Safe',
      description: '"><script>bad()</script>',
      url: '" onload="bad',
    }),
  );
  expect(result.querySelectorAll('script')).toHaveLength(0);
  expect(
    result.querySelector('meta[name="description"]')?.getAttribute('content'),
  ).toBe('"><script>bad()</script>');
  const circular: Record<string, unknown> = {};
  circular.self = circular;
  expect(() =>
    generateSEOTags({ title: 'Title', description: 'Text', jsonLd: circular }),
  ).toThrow();
  expect(
    generateSEOTags({
      title: 'Title',
      description: 'Text',
      jsonLd: { toJSON: () => undefined },
    }),
  ).toContain('>null</script>');
});

for (const example of examples) {
  test(`example ${example.name} renders document metadata or server HTML`, () => {
    const view = render(createElement(example.render));
    expect(view.container.textContent).not.toBe('');
  });
}
