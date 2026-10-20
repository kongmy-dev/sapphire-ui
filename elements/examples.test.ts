import { afterEach, expect, it } from 'bun:test';
import { examples as banners } from './banner.examples.js';
import { examples as footers } from './site-footer.examples.js';
import { examples as headers } from './site-header.examples.js';

afterEach(() => {
  document.body.replaceChildren();
  localStorage.clear();
});

for (const example of [...banners, ...headers, ...footers]) {
  it(`connects ${example.render.name} ${example.name} without duplicating its markup`, () => {
    const element = example.render();
    document.body.append(element);
    const markup = element.innerHTML;
    element.remove();
    document.body.append(element);
    expect(element.innerHTML).toBe(markup);
    expect(element.className).toStartWith('sp-');
  });
}
