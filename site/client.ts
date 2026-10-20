import { getTheme, initTheme, setTheme, subscribeTheme } from '../lib/theme.js';
import { initSearch } from './search.js';

const menu = document.querySelector<HTMLButtonElement>('.docs-menu');
const search = document.querySelector<HTMLButtonElement>('.docs-search');
const main = document.querySelector<HTMLElement>('#main');
const mobile = matchMedia('(max-width: 48rem)');
const theme = document.querySelector<HTMLButtonElement>('.docs-theme');

function navigation(open: boolean) {
  document.body.toggleAttribute('data-nav-open', open);
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute(
    'aria-label',
    open ? 'Close navigation' : 'Open navigation',
  );
  if (main) main.inert = open;
  if (open) search?.focus();
  else if (mobile.matches) menu?.focus();
}

function themeLabel() {
  const current = getTheme();
  theme?.setAttribute(
    'aria-label',
    `Switch to ${current === 'dark' ? 'light' : 'dark'} theme`,
  );
  if (theme) theme.textContent = `Theme: ${current}`;
}

function trapNavigation(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !document.body.hasAttribute('data-nav-open'))
    return;
  const candidates = document.querySelectorAll<HTMLElement>(
    '.docs-mobile-bar a, .docs-menu, .docs-sidebar a, .docs-sidebar input, .docs-sidebar summary, .docs-sidebar button',
  );
  const visible = [...candidates].filter(
    (element) => element.getClientRects().length > 0,
  );
  const first = visible[0];
  const last = visible.at(-1);
  const boundary = event.shiftKey ? first : last;
  if (document.activeElement !== boundary) return;
  event.preventDefault();
  (event.shiftKey ? last : first)?.focus();
}

function shortcuts(event: KeyboardEvent) {
  if (document.querySelector('dialog[open]')) return;
  if (event.key === 'Escape' && document.body.hasAttribute('data-nav-open')) {
    navigation(false);
    menu?.focus();
  }
  trapNavigation(event);
}

initTheme();
initSearch();
themeLabel();
subscribeTheme(themeLabel);
theme?.addEventListener('click', () =>
  setTheme(getTheme() === 'dark' ? 'light' : 'dark'),
);
menu?.addEventListener('click', () =>
  navigation(!document.body.hasAttribute('data-nav-open')),
);
document
  .querySelector('.docs-nav-backdrop')
  ?.addEventListener('click', () => navigation(false));
document.addEventListener('keydown', shortcuts);
mobile.addEventListener('change', () => navigation(false));
for (const link of document.querySelectorAll('.docs-nav-link'))
  link.addEventListener('click', () => navigation(false));

for (const frame of document.querySelectorAll('iframe')) {
  frame.addEventListener('load', () => {
    const content = frame.contentDocument?.getElementById('example');
    if (!content) return;
    const resize = () => {
      const height = Math.ceil(
        content.getBoundingClientRect().height +
          48 +
          frame.offsetHeight -
          frame.clientHeight,
      );
      frame.height = String(Math.min(640, Math.max(160, height)));
    };
    new ResizeObserver(resize).observe(content);
    resize();
  });
}
