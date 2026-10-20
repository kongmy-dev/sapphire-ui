import { CookieBannerElement } from './cookie-banner.js';

function PrivacyChoices() {
  if (!CookieBannerElement)
    throw new Error('Cookie banner examples require a browser');
  const section = document.createElement('section');
  const banner = new CookieBannerElement();
  banner.setAttribute('force-show', '');
  const reopen = document.createElement('button');
  reopen.className = 'sp-button';
  reopen.textContent = 'Reopen privacy choices';
  reopen.addEventListener('click', () => banner.open());
  section.append(reopen, banner);
  return section;
}

function LocalizedChoices() {
  if (!CookieBannerElement)
    throw new Error('Cookie banner examples require a browser');
  const banner = new CookieBannerElement();
  banner.setAttribute('force-show', '');
  banner.setAttribute('heading', 'Privasi anda');
  banner.setAttribute('accept-label', 'Terima');
  banner.setAttribute('decline-label', 'Tolak');
  return banner;
}

export const examples = [
  { name: 'choices', render: PrivacyChoices },
  { name: 'localized', render: LocalizedChoices },
] as const;
