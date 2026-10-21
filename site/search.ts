const dialog = document.querySelector<HTMLDialogElement>('#docs-search-dialog');
const input = dialog?.querySelector<HTMLInputElement>('input');
const list = dialog?.querySelector<HTMLUListElement>('[role="listbox"]');
const empty = dialog?.querySelector<HTMLElement>('[role="status"]');
const trigger = document.querySelector<HTMLButtonElement>('.docs-search');
const pages = [
  ...document.querySelectorAll<HTMLAnchorElement>('.docs-nav-link'),
].map((link) => ({
  href: link.href,
  label: link.textContent ?? '',
  group:
    link.closest('details')?.querySelector('summary')?.textContent ?? 'Guides',
}));
let matches = pages;
let active = 0;
let launcher: HTMLElement | null = null;

function highlight(index: number) {
  active = Math.max(0, Math.min(index, matches.length - 1));
  for (const [position, item] of [...(list?.children ?? [])].entries())
    item.setAttribute('aria-selected', String(position === active));
  const selected = list?.children[active];
  if (selected) {
    input?.setAttribute('aria-activedescendant', selected.id);
    selected.scrollIntoView({ block: 'nearest' });
  } else input?.removeAttribute('aria-activedescendant');
}

function select(index: number) {
  const page = matches[index];
  if (page) window.location.assign(page.href);
}

function results() {
  if (!input || !list) return;
  const query = input.value.trim().toLowerCase();
  matches = pages.filter((page) =>
    `${page.label} ${page.group}`.toLowerCase().includes(query),
  );
  list.replaceChildren();
  for (const [index, page] of matches.entries()) {
    const item = document.createElement('li');
    item.id = `docs-search-option-${index}`;
    item.className = 'sp-command-palette-item';
    item.setAttribute('role', 'option');
    const label = document.createElement('span');
    label.className = 'sp-command-palette-label';
    label.textContent = page.label;
    const hint = document.createElement('span');
    hint.className = 'sp-command-palette-hint';
    hint.textContent = page.group;
    item.append(label, hint);
    item.addEventListener('pointermove', () => highlight(index));
    item.addEventListener('mousedown', (event) => event.preventDefault());
    item.addEventListener('click', () => select(index));
    list.append(item);
  }
  if (empty) empty.hidden = matches.length > 0;
  highlight(0);
}

function open(from: Element | null) {
  if (!dialog || !input || dialog.open) return;
  const modal = [
    ...document.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], dialog[open]',
    ),
  ].some((element) => element.getClientRects().length > 0);
  if (modal) return;
  launcher = from instanceof HTMLElement ? from : null;
  input.value = '';
  dialog.showModal();
  results();
  input.focus();
}

function keyboard(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    highlight(active + (event.key === 'ArrowDown' ? 1 : -1));
  }
  if (event.key === 'Enter') {
    event.preventDefault();
    select(active);
  }
}

export function initSearch() {
  trigger?.addEventListener('click', () => open(trigger));
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented) return;
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k')
      return;
    event.preventDefault();
    if (dialog?.open) dialog.close();
    else open(document.activeElement);
  });
  input?.addEventListener('input', results);
  input?.addEventListener('keydown', keyboard);
  dialog
    ?.querySelector('button')
    ?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => {
    const visible =
      launcher?.getClientRects().length &&
      getComputedStyle(launcher).visibility !== 'hidden';
    const target = visible
      ? launcher
      : document.querySelector<HTMLButtonElement>('.docs-menu');
    target?.focus();
  });
  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      dialog.close();
    }
  });
  dialog?.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
}
