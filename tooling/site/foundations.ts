import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { code } from './render';

const layout = `<div class="sp-columns" data-columns="2"><article class="sp-card sp-stack"><h2>Related content</h2><p>A stack keeps related content together.</p><div class="sp-cluster"><button class="sp-button">Continue</button><button class="sp-button" data-variant="outline">Cancel</button></div></article><article class="sp-card sp-stack"><h2>A second column</h2><p>Columns share the available width. Add data-from="md" inside sp-cq to stack them on narrow screens.</p></article></div>`;
const prose = `<article class="sp-prose"><h2>Make room for the idea</h2><p>Readable typography supports the work. <strong>Use emphasis sparingly</strong>, and give the main action a clear place.</p><h3>Build a steady rhythm</h3><ul><li>Group related content.</li><li>Keep headings descriptive.</li><li>Use the right element for the job.</li></ul><blockquote><p>Clarity comes from choosing what belongs together.</p></blockquote><p><a href="/components/prose/">Explore all prose examples</a>.</p></article>`;

export function foundationGuides(root: string) {
  const tokens = readFileSync(join(root, 'css/tokens.css'), 'utf8');
  return [
    {
      route: 'tokens',
      title: 'Tokens and themes',
      body: `<p>Semantic tokens keep the same component readable in both schemes. Set data-theme="light" or data-theme="dark" on the document element, or omit it to follow the system preference.</p><p>Override semantic colours on :root, [data-theme=light], [data-theme=dark], .dark. Brand gold is decorative; use brand-text for gold text.</p>${code(':root, [data-theme=light], [data-theme=dark], .dark {\n  --primary: var(--foreground-strong);\n}')}<details><summary>All token names and values</summary>${code(tokens)}</details>`,
    },
    {
      route: 'layout',
      title: 'Layout primitives',
      body: `<p>Stack, cluster and columns compose with the page container. These primitives ship in foundations.</p>${layout}<h2>HTML</h2>${code(layout)}`,
    },
    {
      route: 'prose',
      title: 'Prose',
      body: `${code('import "@kongmy-dev/sapphire-ui/prose.css";')}${prose}<h2>HTML</h2>${code(prose)}`,
    },
  ];
}
