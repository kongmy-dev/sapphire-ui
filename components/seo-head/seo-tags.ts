import type { SEOOptions } from './metadata.js';
import { metadata } from './metadata.js';

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function generateSEOTags(props: SEOOptions): string {
  return metadata(props)
    .map(({ tag, attrs, text }) => {
      const attributes = Object.entries(attrs)
        .map(([key, value]) => ` ${key.toLowerCase()}="${escapeHTML(value)}"`)
        .join('');
      if (tag === 'meta' || tag === 'link') return `<${tag}${attributes} />`;
      return `<${tag}${attributes}>${tag === 'script' ? text : escapeHTML(text ?? '')}</${tag}>`;
    })
    .join('\n');
}
