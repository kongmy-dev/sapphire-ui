async function copyToken(token: string, status: HTMLElement) {
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(token);
    status.textContent = `Copied ${token}.`;
  } catch {
    status.textContent = `Could not copy. Select and copy ${token} manually.`;
  }
}

export function initCopy() {
  const status = document.getElementById('docs-copy-status');
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '[data-copy]',
  )) {
    const token = button.dataset.copy;
    if (token && status)
      button.addEventListener('click', () => copyToken(token, status));
  }
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const block = event.target
      .closest('[data-copy-code]')
      ?.closest('.docs-code');
    const source = block?.querySelector('code')?.textContent;
    const feedback = block?.querySelector<HTMLElement>('[role="status"]');
    if (source && feedback) void copySource(source, feedback);
  });
}

async function copySource(source: string, status: HTMLElement) {
  status.hidden = false;
  try {
    if (!navigator.clipboard) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(source);
    status.textContent = 'Copied.';
  } catch {
    status.textContent =
      'Could not copy. Select the code and copy it manually.';
  }
}
