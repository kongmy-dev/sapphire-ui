import { type ReactNode } from 'react';

/* ─── SEO Types ─────────────────────────────────────────────────────── */

export interface SEOProps {
  /** Page title */
  title: string;
  /** Meta description */
  description: string;
  /** Canonical URL */
  url?: string;
  /** OG image URL */
  image?: string;
  /** Site name for OG */
  siteName?: string;
  /** OG type */
  type?: 'website' | 'article';
  /** Twitter card type */
  twitterCard?: 'summary' | 'summary_large_image';
  /** Twitter handle */
  twitterSite?: string;
  /** Article published time (ISO 8601) */
  publishedTime?: string;
  /** Article author */
  author?: string;
  /** Keywords */
  keywords?: string[];
  /** Robots directives */
  robots?: string;
  /** JSON-LD structured data */
  jsonLd?: Record<string, unknown>;
  /** Additional head children */
  children?: ReactNode;
}

/**
 * SEO Head component for React SPAs.
 * Renders <title> and <meta> tags into the document head via React portal-like rendering.
 *
 * For Astro projects, use the `generateSEOTags()` utility instead to get raw HTML strings.
 *
 * Usage:
 * ```tsx
 * <SEOHead
 *   title="Cloud Cost Dashboard"
 *   description="Monitor and optimize your multi-cloud spending."
 *   url="https://cloudcost.kongmy.dev"
 *   image="https://kongmy.dev/og-cloudcost.png"
 *   siteName="KONGMY"
 * />
 * ```
 */
export function SEOHead({
  title,
  description,
  url,
  image,
  siteName = 'KONGMY',
  type = 'website',
  twitterCard = 'summary_large_image',
  twitterSite,
  publishedTime,
  author,
  keywords,
  robots = 'index, follow',
  jsonLd,
  children,
}: SEOProps) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      {robots && <meta name="robots" content={robots} />}
      {keywords && keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {siteName && <meta property="og:site_name" content={siteName} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {/* JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {children}
    </>
  );
}

/* ─── Utility for Astro / SSR ───────────────────────────────────────── */

/**
 * Generate raw SEO HTML string for use in Astro layouts or SSR templates.
 *
 * Usage in Astro:
 * ```astro
 * ---
 * import { generateSEOTags } from '@kongmy-dev/sapphire-ui';
 * const seoHTML = generateSEOTags({ title: 'My Page', description: '...' });
 * ---
 * <head>
 *   <Fragment set:html={seoHTML} />
 * </head>
 * ```
 */
export function generateSEOTags(props: Omit<SEOProps, 'children'>): string {
  const {
    title,
    description,
    url,
    image,
    siteName = 'KONGMY',
    type = 'website',
    twitterCard = 'summary_large_image',
    twitterSite,
    publishedTime,
    author,
    keywords,
    robots = 'index, follow',
    jsonLd,
  } = props;

  const tags: string[] = [];

  tags.push(`<title>${escapeHtml(title)}</title>`);
  tags.push(`<meta name="description" content="${escapeAttr(description)}" />`);
  if (robots) tags.push(`<meta name="robots" content="${escapeAttr(robots)}" />`);
  if (keywords?.length) tags.push(`<meta name="keywords" content="${escapeAttr(keywords.join(', '))}" />`);
  if (url) tags.push(`<link rel="canonical" href="${escapeAttr(url)}" />`);

  // OG
  tags.push(`<meta property="og:title" content="${escapeAttr(title)}" />`);
  tags.push(`<meta property="og:description" content="${escapeAttr(description)}" />`);
  tags.push(`<meta property="og:type" content="${type}" />`);
  if (siteName) tags.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}" />`);
  if (url) tags.push(`<meta property="og:url" content="${escapeAttr(url)}" />`);
  if (image) tags.push(`<meta property="og:image" content="${escapeAttr(image)}" />`);
  if (publishedTime) tags.push(`<meta property="article:published_time" content="${escapeAttr(publishedTime)}" />`);
  if (author) tags.push(`<meta property="article:author" content="${escapeAttr(author)}" />`);

  // Twitter
  tags.push(`<meta name="twitter:card" content="${twitterCard}" />`);
  tags.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`);
  tags.push(`<meta name="twitter:description" content="${escapeAttr(description)}" />`);
  if (image) tags.push(`<meta name="twitter:image" content="${escapeAttr(image)}" />`);
  if (twitterSite) tags.push(`<meta name="twitter:site" content="${escapeAttr(twitterSite)}" />`);

  // JSON-LD
  if (jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  }

  return tags.join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
