import { defaultOrganization } from './organization.js';

export type SEOOptions = {
  title: string;
  description: string;
  url?: string;
  image?: string;
  siteName?: string;
  type?: 'website' | 'article';
  locale?: string;
  hreflang?: Record<string, string>;
  preconnect?: string[];
  preload?: Array<{
    href: string;
    as: string;
    type?: string;
    crossOrigin?: '' | 'anonymous' | 'use-credentials';
  }>;
  isWebSite?: boolean;
  isOrganization?: boolean;
  omitDefaultOrganizationDetails?: boolean;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
  publishedTime?: string;
  author?: string;
  keywords?: string[];
  robots?: string;
  jsonLd?: Record<string, unknown>;
};

type MetadataTag = {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  text?: string;
};

function organization(props: SEOOptions): Record<string, unknown> {
  const siteName = props.siteName ?? 'KONGMY';
  if (props.omitDefaultOrganizationDetails)
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: props.url || 'https://sapphire.kongmy.dev',
      logo: props.image,
    };
  return {
    ...defaultOrganization,
    name: siteName || defaultOrganization.name,
    url: props.url || defaultOrganization.url,
    image: props.image || defaultOrganization.image,
  };
}

function structuredData(props: SEOOptions): Record<string, unknown>[] {
  const result: Record<string, unknown>[] = [];
  if (props.isOrganization) result.push(organization(props));
  if (props.isWebSite)
    result.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: props.siteName ?? 'KONGMY',
      url: props.url || 'https://sapphire.kongmy.dev',
    });
  if (props.jsonLd) result.push(props.jsonLd);
  return result;
}

function resourceLinks(props: SEOOptions): MetadataTag[] {
  const tags: MetadataTag[] = [];
  if (props.url)
    tags.push({ tag: 'link', attrs: { rel: 'canonical', href: props.url } });
  for (const [hrefLang, href] of Object.entries(props.hreflang ?? {}))
    tags.push({ tag: 'link', attrs: { rel: 'alternate', hrefLang, href } });
  for (const href of props.preconnect ?? [])
    tags.push({
      tag: 'link',
      attrs: { rel: 'preconnect', href, crossOrigin: 'anonymous' },
    });
  return tags.concat((props.preload ?? []).map(preloadLink));
}

function preloadLink(
  preload: NonNullable<SEOOptions['preload']>[number],
): MetadataTag {
  const attrs: Record<string, string> = {
    rel: 'preload',
    href: preload.href,
    as: preload.as,
  };
  if (preload.type !== undefined) attrs.type = preload.type;
  if (preload.crossOrigin !== undefined)
    attrs.crossOrigin = preload.crossOrigin;
  return { tag: 'link', attrs };
}

export function metadata(props: SEOOptions): MetadataTag[] {
  const tags: MetadataTag[] = [{ tag: 'title', attrs: {}, text: props.title }];
  const meta = (name: string, content: string | undefined) => {
    if (content) tags.push({ tag: 'meta', attrs: { name, content } });
  };
  const property = (name: string, content: string | undefined) => {
    if (content) tags.push({ tag: 'meta', attrs: { property: name, content } });
  };
  meta('description', props.description);
  meta('robots', props.robots ?? 'index, follow');
  if (props.keywords?.length) meta('keywords', props.keywords.join(', '));
  property('og:title', props.title);
  property('og:description', props.description);
  property('og:type', props.type ?? 'website');
  property('og:site_name', props.siteName ?? 'KONGMY');
  property('og:url', props.url);
  property('og:image', props.image);
  if (props.type === 'article') {
    property('article:published_time', props.publishedTime);
    property('article:author', props.author);
  }
  meta('twitter:card', props.twitterCard ?? 'summary_large_image');
  meta('twitter:title', props.title);
  meta('twitter:description', props.description);
  meta('twitter:image', props.image);
  meta('twitter:site', props.twitterSite);
  property('og:locale', props.locale);
  tags.push(...resourceLinks(props));
  return tags.concat(structuredData(props).map(jsonTag));
}

function jsonTag(value: Record<string, unknown>): MetadataTag {
  return {
    tag: 'script',
    attrs: { type: 'application/ld+json' },
    text: JSON.stringify(value)?.replace(/</g, '\\u003c') ?? 'null',
  };
}
