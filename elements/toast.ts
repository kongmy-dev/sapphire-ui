const variants = ['success', 'info', 'warning', 'error'] as const;
export type ToastType = (typeof variants)[number];
const icons: Record<ToastType, string> = {
  success:
    '<circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path>',
  info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path>',
  warning:
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4M12 17h.01"></path>',
  error:
    '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4M12 16h.01"></path>',
};

function notification(message: string, type: ToastType) {
  const toast = document.createElement('div');
  toast.className = 'sp-toast';
  toast.dataset.slot = 'toast';
  toast.dataset.variant = type;
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [name, value] of Object.entries({
    'aria-hidden': 'true',
    class: 'sp-toast-icon sp-icon',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }))
    icon.setAttribute(name, value);
  icon.innerHTML = icons[type];
  const text = document.createElement('span');
  text.className = 'sp-toast-message';
  text.textContent = message;
  toast.append(icon, text);
  return toast;
}

function createToastElement() {
  return class ToastElement extends HTMLElement {
    static #owners = new Set<ToastElement>();
    static #previous: unknown;
    #container: HTMLDivElement | undefined;
    #pending = new Set<() => void>();
    #bridge: ToastElement['show'];

    constructor() {
      super();
      this.#bridge = this.show.bind(this);
    }

    connectedCallback() {
      if (this.#container) return;
      this.#container = document.createElement('div');
      this.#container.className = 'sp-toast-viewport';
      this.#container.setAttribute('role', 'status');
      this.#container.setAttribute('aria-live', 'polite');
      this.#container.setAttribute('aria-atomic', 'false');
      this.#container.setAttribute('aria-relevant', 'additions text');
      this.append(this.#container);
      if (ToastElement.#owners.size === 0)
        ToastElement.#previous = Reflect.get(window, '__sapphireToast');
      ToastElement.#owners.add(this);
      Reflect.set(window, '__sapphireToast', this.#bridge);
    }

    disconnectedCallback() {
      for (const dispose of this.#pending) dispose();
      this.#pending.clear();
      this.#container?.remove();
      this.#container = undefined;
      ToastElement.#owners.delete(this);
      if (Reflect.get(window, '__sapphireToast') !== this.#bridge) return;
      const owner = [...ToastElement.#owners].at(-1);
      const bridge = owner ? owner.#bridge : ToastElement.#previous;
      if (bridge === undefined)
        Reflect.deleteProperty(window, '__sapphireToast');
      else Reflect.set(window, '__sapphireToast', bridge);
    }

    show(message: string, type: ToastType = 'success', durationMs?: number) {
      if (!this.isConnected || !this.#container) return;
      const attr = Number(this.getAttribute('duration'));
      const candidate =
        durationMs ?? (Number.isFinite(attr) && attr > 0 ? attr : 5000);
      const duration = Number.isFinite(candidate)
        ? Math.max(0, candidate)
        : 5000;
      const toast = notification(message, type);
      this.#container.append(toast);
      const frame = requestAnimationFrame(() => {
        toast.dataset.state = 'open';
      });
      const close = setTimeout(() => {
        cancelAnimationFrame(frame);
        delete toast.dataset.state;
      }, duration);
      const remove = setTimeout(() => {
        toast.remove();
        this.#pending.delete(dispose);
      }, duration + 400);
      const dispose = () => {
        cancelAnimationFrame(frame);
        clearTimeout(close);
        clearTimeout(remove);
      };
      this.#pending.add(dispose);
    }
  };
}

export const ToastElement =
  typeof HTMLElement === 'undefined' ? undefined : createToastElement();
export type ToastElement = InstanceType<NonNullable<typeof ToastElement>>;

if (ToastElement && !customElements.get('sapphire-toast'))
  customElements.define('sapphire-toast', ToastElement);
