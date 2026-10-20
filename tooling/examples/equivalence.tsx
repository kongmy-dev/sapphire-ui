import { createRef, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Analytics } from '../../components/analytics/analytics';
import { Banner } from '../../components/banner/banner';
import { CookieBanner } from '../../components/cookie-banner/cookie-banner';
import { SiteFooter } from '../../components/site-footer/site-footer';
import { SiteHeader } from '../../components/site-header/site-header';
import { Toast, type ToastRef } from '../../components/toast/toast';
import { AnalyticsElement } from '../../elements/analytics';
import { BannerElement } from '../../elements/banner';
import { CookieBannerElement } from '../../elements/cookie-banner';
import { SiteFooterElement } from '../../elements/site-footer';
import { SiteHeaderElement } from '../../elements/site-header';
import { ToastElement } from '../../elements/toast';

if (
  [
    AnalyticsElement,
    BannerElement,
    CookieBannerElement,
    SiteFooterElement,
    SiteHeaderElement,
    ToastElement,
  ].some((elementClass) => !elementClass)
)
  throw new Error('Browser constructors missing');

const ref = createRef<ToastRef>();
const twins: Record<string, { native: string; react: ReactNode }> = {
  banner: {
    native:
      '<sapphire-banner variant="success" dismissible>Message</sapphire-banner>',
    react: <Banner variant="success">Message</Banner>,
  },
  'cookie-banner': {
    native: '<cookie-banner force-show></cookie-banner>',
    react: <CookieBanner forceShow />,
  },
  'site-header': {
    native:
      '<sapphire-site-header variant="light" sticky><span data-slot="brand">Brand</span><a data-slot="nav" href="#nav">Nav</a><button data-slot="actions">Action</button></sapphire-site-header>',
    react: (
      <SiteHeader
        variant="light"
        sticky
        brand={<span>Brand</span>}
        nav={<a href="#nav">Nav</a>}
        actions={<button type="button">Action</button>}
      />
    ),
  },
  'site-footer': {
    native:
      '<sapphire-site-footer variant="light"><span data-slot="brand">Brand</span><a data-slot="links" href="#links">Links</a><span data-slot="bottom">Bottom</span></sapphire-site-footer>',
    react: (
      <SiteFooter
        variant="light"
        brand={<span>Brand</span>}
        links={<a href="#links">Links</a>}
        bottom={<span>Bottom</span>}
      />
    ),
  },
  analytics: {
    native: '<sapphire-analytics></sapphire-analytics>',
    react: <Analytics />,
  },
  toast: {
    native: '<sapphire-toast></sapphire-toast>',
    react: <Toast ref={ref} />,
  },
};

const name = new URL(location.href).searchParams.get('component') ?? '';
const pair = twins[name];
if (!pair) throw new Error('Unknown equivalence fixture');
const native = document.createElement('section');
native.id = 'native';
native.innerHTML = pair.native;
const react = document.createElement('section');
react.id = 'react';
document.body.append(native, react);
flushSync(() => createRoot(react).render(pair.react));
const toast = native.querySelector('sapphire-toast');
if (ToastElement && toast instanceof ToastElement) {
  toast.show('Shared notification', 'info', 60000);
  flushSync(() => ref.current?.show('Shared notification', 'info', 60000));
}
document.documentElement.dataset.ready = 'true';
