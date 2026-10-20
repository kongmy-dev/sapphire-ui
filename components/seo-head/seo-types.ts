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
