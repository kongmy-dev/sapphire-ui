import { readVisualExamples } from '../examples/catalog.js';
import { readElementExamples } from '../examples/elements.js';
import sectionPins from './section-pins.json' with { type: 'json' };

export const ARCHIVED_DOCUMENTATION_PINS = {
  'elements/custom-elements-astro-vanilla-html':
    'Obsolete setup prose; native examples and elements-equivalence.spec.ts cover the rendered elements.',
  'elements/toast-banner-cookie-banner':
    'Obsolete imperative API usage snippets; native examples and elements.a11y.spec.ts cover lifecycle and behavior.',
  'elements/seo-head':
    'Obsolete SEO usage snippets; seo-head and seo-tags public API tests cover emitted metadata and escaping.',
} as const;

export const exampleNames = (): string[] => [
  'parity-states',
  ...readElementExamples(process.cwd()).map(
    (row) => `native/${row.component}/${row.name}`,
  ),
  ...readVisualExamples(process.cwd()).map(({ name }) => name),
  ...sectionPins,
];
