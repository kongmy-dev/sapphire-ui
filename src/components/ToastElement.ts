// Toast Web Component — framework-agnostic notification system

const SSRHTMLElement = typeof window !== 'undefined' ? HTMLElement : class {} as typeof HTMLElement;

export type ToastType = 'success' | 'info' | 'warning' | 'error';

const ICON_MAP: Record<ToastType, string> = {
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
  error: 'error',
};

// Per-type colors live in CSS (`.sapphire-toast[data-type="..."]` rules in
// index.css) so vanilla / Astro consumers get full styling without JS having
// to write inline styles. The data-type attribute on the toast root is the
// single source of truth.

export class ToastElement extends SSRHTMLElement {
  private container: HTMLDivElement | null = null;

  connectedCallback() {
    if (typeof window === 'undefined') return;

    // Create the fixed container
    this.container = document.createElement('div');
    this.container.className = 'sapphire-toast-container';
    this.appendChild(this.container);

    // Expose global helper
    (window as any).__sapphireToast = this.show.bind(this);
  }

  disconnectedCallback() {
    delete (window as any).__sapphireToast;
  }

  /**
   * Show a toast notification.
   * Can be called via: `document.querySelector('sapphire-toast').show('Message', 'success')`
   * Or via the global: `window.__sapphireToast('Message', 'success')`
   */
  public show(message: string, type: ToastType = 'success', durationMs = 5000) {
    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = 'sapphire-toast';
    toast.setAttribute('data-type', type);

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined sapphire-toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICON_MAP[type];

    const messageEl = document.createElement('span');
    messageEl.className = 'sapphire-toast-message';
    messageEl.textContent = message;

    toast.append(icon, messageEl);

    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 400);
    }, durationMs);
  }
}

if (typeof window !== 'undefined' && !customElements.get('sapphire-toast')) {
  customElements.define('sapphire-toast', ToastElement);
}
