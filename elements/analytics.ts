import { mountAnalytics } from '../lib/analytics.js';

function createAnalyticsElement() {
  return class AnalyticsElement extends HTMLElement {
    static observedAttributes = [
      'ga-id',
      'posthog-token',
      'posthog-host',
      'posthog-ui-host',
      'domains',
    ];
    constructor() {
      super();
      this.#release = undefined;
    }

    #release: (() => void) | undefined;

    connectedCallback() {
      this.#sync();
    }

    disconnectedCallback() {
      this.#release?.();
      this.#release = undefined;
    }

    attributeChangedCallback() {
      if (this.isConnected) this.#sync();
    }

    #sync() {
      this.#release?.();
      this.#release = mountAnalytics({
        gaId: this.getAttribute('ga-id') ?? undefined,
        posthogToken: this.getAttribute('posthog-token') ?? undefined,
        posthogHost: this.getAttribute('posthog-host') ?? undefined,
        posthogUiHost: this.getAttribute('posthog-ui-host') ?? undefined,
        domains: this.getAttribute('domains') ?? undefined,
      });
    }
  };
}

export const AnalyticsElement =
  typeof HTMLElement === 'undefined' ? undefined : createAnalyticsElement();
export type AnalyticsElement = InstanceType<
  NonNullable<typeof AnalyticsElement>
>;

if (AnalyticsElement && !customElements.get('sapphire-analytics'))
  customElements.define('sapphire-analytics', AnalyticsElement);
