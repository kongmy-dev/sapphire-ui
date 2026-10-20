import { ToastElement, type ToastType } from './toast.js';

function Notifications() {
  if (!ToastElement) throw new Error('Toast examples require a browser');
  const section = document.createElement('section');
  const toasts = new ToastElement();
  const statuses: readonly ToastType[] = [
    'success',
    'info',
    'warning',
    'error',
  ];
  for (const status of statuses) {
    const button = document.createElement('button');
    button.className = 'sp-button';
    button.textContent = `Show ${status}`;
    button.addEventListener('click', () =>
      toasts.show(`${status} notification`, status),
    );
    section.append(button);
  }
  section.append(toasts);
  return section;
}

export const examples = [{ name: 'statuses', render: Notifications }] as const;
