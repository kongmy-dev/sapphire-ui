import { SEOHead } from './seo-head.js';
import { generateSEOTags } from './seo-tags.js';

function MetadataExample() {
  return (
    <>
      <SEOHead
        title="Sapphire metadata example"
        description="Accessible document metadata"
        isWebSite
      />
      <p>
        Document metadata includes a title, description, and website structured
        data.
      </p>
    </>
  );
}

function RawHTMLExample() {
  return (
    <pre>
      {generateSEOTags({
        title: 'Server-rendered metadata',
        description: 'Works without React.',
      })}
    </pre>
  );
}

export const examples = [
  { name: 'metadata', render: MetadataExample },
  { name: 'raw-html', render: RawHTMLExample },
] as const;
