import { getTheme, initTheme, setTheme, subscribeTheme } from '../lib/theme.js';
import { initCopy } from './copy.js';
import { mountHooks } from './hooks.js';
import { initSearch } from './search.js';
import { initUsage } from './usage.js';

const menu = document.querySelector<HTMLButtonElement>('.docs-menu');
const sidebar = document.querySelector<HTMLElement>('#docs-sidebar');
const close = document.querySelector<HTMLButtonElement>('.docs-sidebar-close');
const search = document.querySelector<HTMLButtonElement>('.docs-search');
const mobile = matchMedia('(max-width: 48rem)');
const theme = document.querySelector<HTMLButtonElement>('.docs-theme');

function navigation(open: boolean) {
  document.body.toggleAttribute('data-nav-open', open);
  menu?.setAttribute('aria-expanded', String(open));
  if (open) {
    sidebar?.setAttribute('role', 'dialog');
    sidebar?.setAttribute('aria-modal', 'true');
    sidebar?.setAttribute('aria-label', 'Documentation navigation');
  } else {
    sidebar?.removeAttribute('aria-modal');
    sidebar?.removeAttribute('role');
    sidebar?.removeAttribute('aria-label');
  }
  for (const element of document.querySelectorAll<HTMLElement>(
    '.docs-mobile-bar, .docs-site > a, #main',
  ))
    element.inert = open;
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
    '.docs-sidebar a, .docs-sidebar input, .docs-sidebar summary, .docs-sidebar button',
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
initCopy();
initUsage();
mountHooks();
themeLabel();
subscribeTheme(themeLabel);
theme?.addEventListener('click', () =>
  setTheme(getTheme() === 'dark' ? 'light' : 'dark'),
);
menu?.addEventListener('click', () =>
  navigation(!document.body.hasAttribute('data-nav-open')),
);
close?.addEventListener('click', () => navigation(false));
document
  .querySelector('.docs-nav-backdrop')
  ?.addEventListener('click', () => navigation(false));
document.addEventListener('keydown', shortcuts);
mobile.addEventListener('change', () => {
  if (!document.body.hasAttribute('data-nav-open')) return;
  navigation(false);
  if (!mobile.matches) search?.focus();
});
for (const link of document.querySelectorAll('.docs-nav-link'))
  link.addEventListener('click', () => navigation(false));
