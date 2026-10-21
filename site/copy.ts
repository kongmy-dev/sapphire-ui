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
  if (!status) return;
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    '[data-copy]',
  )) {
    const token = button.dataset.copy;
    if (token) button.addEventListener('click', () => copyToken(token, status));
  }
}
