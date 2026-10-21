export const escapeHtml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export const titleOf = (name: string) =>
  name
    .split('-')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

export const code = (source: string, label = 'code') =>
  `<div class="sp-code-block docs-code"><button type="button" class="docs-copy" data-copy-code aria-label="Copy ${escapeHtml(label)}">Copy ${escapeHtml(label)}</button><pre class="sp-code-block-pre" tabindex="0"><code>${escapeHtml(source)}</code></pre><p class="docs-copy-status" role="status" aria-live="polite" hidden></p></div>`;

export function table(
  caption: string,
  headings: readonly string[],
  rows: readonly (readonly string[])[],
) {
  return `<div class="docs-table-wrap" role="region" aria-label="${escapeHtml(caption)}" tabindex="0"><table class="docs-table"><caption>${escapeHtml(caption)}</caption><thead><tr>${headings.map((heading) => `<th scope="col">${heading}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((value, index) => `<${index ? 'td' : 'th scope="row"'}>${value}</${index ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
