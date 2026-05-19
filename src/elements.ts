// Framework-agnostic entry — registers all Sapphire UI Web Components.
// Importing this module has the side effect of calling customElements.define()
// for every <sapphire-*> element. It pulls in no React dependencies.
//
// Usage (Astro / vanilla HTML):
//   import '@kongmy-dev/sapphire-ui/elements';
//   import '@kongmy-dev/sapphire-ui/style.css';
//   // then use <sapphire-toast />, <sapphire-analytics />, <cookie-banner /> anywhere.

import './components/ToastElement';
import './components/CookieBannerElement';
import './components/AnalyticsElement';
import './components/BannerElement';

export { ToastElement } from './components/ToastElement';
export type { ToastType } from './components/ToastElement';
export { CookieBannerElement } from './components/CookieBannerElement';
export { AnalyticsElement } from './components/AnalyticsElement';
export { BannerElement } from './components/BannerElement';
export type { BannerVariant } from './components/BannerElement';

export {
  getConsentStatus,
  setConsentStatus,
  updateTrackers,
} from './lib/consent';
export type { ConsentPreferences, ConsentState } from './lib/consent';

export {
  getTheme,
  getThemePreference,
  setTheme,
  resolveSystemTheme,
  subscribeTheme,
  initTheme,
} from './lib/theme';
export type { Theme, ThemePreference } from './lib/theme';
