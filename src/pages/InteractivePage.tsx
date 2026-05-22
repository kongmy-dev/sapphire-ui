import { useState, useRef } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogClose, ConfirmDialog,
} from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Toast, type ToastRef } from '../components/Toast';
import { PageSection } from '../components/ui/PageSection';
import { SiteHeader, SiteHeaderLink } from '../components/ui/SiteHeader';
import { SiteFooter, SiteFooterGroup, SiteFooterLink } from '../components/ui/SiteFooter';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function InteractivePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const toastRef = useRef<ToastRef>(null);

  return (
    <div>
      <header className="docs-page-header">
        <h1>Interactive</h1>
        <p>
          Modal dialogs, toast notifications, page sections, and site shell components.
        </p>
      </header>

      {/* ─── Dialog ─────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Dialog</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Accessible modal built on Radix Dialog. Includes focus trap, Escape close, and overlay click dismiss.
          Use the compound sub-components for custom layouts, or <code className="docs-props-table code">ConfirmDialog</code> for quick confirmations.
        </p>
        <div className="docs-preview">
          <div className="docs-flex">
            {/* Custom Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent maxWidth="500px">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <DialogDescription>Update your display name and email address.</DialogDescription>
                  <div className="mt-4 flex flex-col gap-4">
                    <div>
                      <Label htmlFor="dialog-name">Name</Label>
                      <Input id="dialog-name" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="dialog-email">Email</Label>
                      <Input id="dialog-email" placeholder="jane@example.com" />
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => setDialogOpen(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ConfirmDialog */}
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm Action"
              message="Are you sure you want to sync all cloud accounts? This may take a few minutes."
              confirmLabel="Sync Now"
              onConfirm={() => toastRef.current?.show('Sync started!', 'success')}
            />

            {/* Danger Dialog */}
            <Button variant="outline" onClick={() => setDangerOpen(true)} style={{ color: 'var(--color-error)' }}>
              Danger Dialog
            </Button>
            <ConfirmDialog
              open={dangerOpen}
              onOpenChange={setDangerOpen}
              title="Delete Account"
              message="This action is permanent and cannot be undone. All data will be lost."
              confirmLabel="Delete"
              isDanger
              onConfirm={() => toastRef.current?.show('Account deleted.', 'error')}
            />
          </div>
        </div>
      </section>

      {/* ─── Toast ──────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Toast</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Framework-agnostic toast notifications via Web Component. React wrapper exposes <code className="docs-props-table code">show()</code> via ref.
          Also available in vanilla JS via <code className="docs-props-table code">window.__sapphireToast()</code>.
        </p>
        <div className="docs-preview">
          <div className="docs-flex">
            <Button variant="primary" onClick={() => toastRef.current?.show('Changes saved successfully!', 'success')}>
              Success Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('New version available.', 'info')}>
              Info Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('API rate limit approaching.', 'warning')}>
              Warning Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('Connection failed.', 'error')}>
              Error Toast
            </Button>
          </div>
        </div>
        <Toast ref={toastRef} />
      </section>

      {/* ─── PageSection ────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">PageSection</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Consistent section wrapper with constrained width, optional label + heading + subheading. Eliminates repeated <code className="docs-props-table code">max-w-7xl mx-auto px-6</code> boilerplate.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden' }}>
          <PageSection
            label="01 — Services"
            heading="What we build"
            subheading="Cloud infrastructure, AI/ML pipelines, and custom software for growing businesses."
            maxWidth="full"
            style={{ padding: '2rem 1.5rem', background: 'var(--color-surface)' }}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {['Cloud Ops', 'AI / ML', 'Web Apps'].map((t) => (
                <div key={t} className="rounded-md border border-border bg-(--color-card-bg) p-6">
                  <span className="font-sans font-semibold text-(--color-text-strong)">{t}</span>
                </div>
              ))}
            </div>
          </PageSection>
        </div>

        <table className="docs-props-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>heading</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>subheading</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>label</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>maxWidth</code></td><td><code>sm | md | lg | xl | 7xl | full</code></td><td><code>7xl</code></td></tr>
          </tbody>
        </table>
      </section>

      {/* ─── SiteHeader ─────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">SiteHeader</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Composable sticky header with brand, nav, and actions slots. Dark (default) and light variants.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <SiteHeader
            sticky={false}
            brand={
              <>
                <span className="font-serif text-lg font-bold">KONGMY</span>
                <span className="font-sans text-lg font-light text-accent">dev</span>
              </>
            }
            nav={
              <>
                <SiteHeaderLink href="#" active>Home</SiteHeaderLink>
                <SiteHeaderLink href="#">Services</SiteHeaderLink>
                <SiteHeaderLink href="#">Blog</SiteHeaderLink>
                <SiteHeaderLink href="#">Contact</SiteHeaderLink>
              </>
            }
            actions={
              <Button variant="on-dark-primary" size="sm">Get Started</Button>
            }
          />
        </div>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)', marginTop: 12 }}>
          <SiteHeader
            sticky={false}
            variant="light"
            brand={
              <>
                <span className="font-serif text-lg font-bold">Cloud</span>
                <span className="font-sans text-lg font-light text-accent">Cost</span>
              </>
            }
            nav={
              <>
                <SiteHeaderLink href="#" variant="light" active>Dashboard</SiteHeaderLink>
                <SiteHeaderLink href="#" variant="light">Projects</SiteHeaderLink>
                <SiteHeaderLink href="#" variant="light">Settings</SiteHeaderLink>
              </>
            }
            actions={
              <Button variant="primary" size="sm">Sync</Button>
            }
          />
        </div>
      </section>

      {/* ─── SiteFooter ─────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">SiteFooter</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Composable footer with brand, link groups, and bottom bar slots.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <SiteFooter
            brand={
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-serif text-xl font-bold text-white">KONGMY</span>
                  <span className="font-sans text-xl font-light text-accent">dev</span>
                </div>
                <p className="m-0 font-sans text-sm/relaxed text-(--color-text-on-dark-muted)">
                  Helping businesses cut costs, automate operations, and build software that works.
                </p>
              </div>
            }
            links={
              <>
                <SiteFooterGroup title="Products">
                  <SiteFooterLink href="#">CloudCost</SiteFooterLink>
                  <SiteFooterLink href="#">Web Toolbox</SiteFooterLink>
                  <SiteFooterLink href="#">Sapphire UI</SiteFooterLink>
                </SiteFooterGroup>
                <SiteFooterGroup title="Resources">
                  <SiteFooterLink href="#">Blog</SiteFooterLink>
                  <SiteFooterLink href="#">Documentation</SiteFooterLink>
                  <SiteFooterLink href="#">GitHub</SiteFooterLink>
                </SiteFooterGroup>
                <SiteFooterGroup title="Legal">
                  <SiteFooterLink href="#">Privacy Policy</SiteFooterLink>
                  <SiteFooterLink href="#">Terms of Service</SiteFooterLink>
                </SiteFooterGroup>
              </>
            }
            bottom={
              <>
                <span>© 2024 KONGMY Digital Solutions</span>
                <span>Built with Sapphire UI</span>
              </>
            }
          />
        </div>
      </section>

      {/* ─── Layout ─────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Layout</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Canonical page shell — composes <code className="docs-props-table code">SiteHeader</code>,
          <code className="docs-props-table code">SiteFooter</code>, and an optional sidebar slot into a
          full-height column. Used by every kongmy.dev app so consumers get the
          same header/main/footer rhythm in one import.
        </p>
        <div className="docs-preview" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
          <Layout
            style={{ minHeight: 360 }}
            header={
              <SiteHeader
                sticky={false}
                brand={
                  <>
                    <span className="font-serif text-lg font-bold">KONGMY</span>
                    <span className="font-sans text-lg font-light text-accent">dev</span>
                  </>
                }
                nav={
                  <>
                    <SiteHeaderLink href="#" active>Home</SiteHeaderLink>
                    <SiteHeaderLink href="#">Docs</SiteHeaderLink>
                  </>
                }
              />
            }
            footer={
              <SiteFooter
                brand={
                  <span className="font-sans text-sm text-(--color-text-on-dark-muted)">
                    © KONGMY Digital Solutions
                  </span>
                }
                bottom={<span>Built with Sapphire UI</span>}
              />
            }
          >
            <div style={{ padding: '2rem 1.5rem' }}>
              <h3 className="m-0 mb-2 font-serif text-xl font-semibold text-(--color-text-strong)">
                Main content area
              </h3>
              <p className="m-0 font-sans text-sm text-(--color-text-muted)">
                Pages, routes, or any children render here between the header and footer slots.
              </p>
            </div>
          </Layout>
        </div>

        <pre className="docs-code" style={{ display: 'block', padding: 16, marginTop: 12 }}>
{`<Layout
  header={<SiteHeader brand={...} nav={...} />}
  footer={<SiteFooter brand={...} links={...} />}
  // sidebar={<aside>…</aside>} // optional left rail
>
  <Routes>{...}</Routes>
</Layout>`}
        </pre>

        <table className="docs-props-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>header</code></td><td><code>ReactNode</code></td><td>—</td></tr>
            <tr><td><code>sidebar</code></td><td><code>ReactNode</code></td><td>—</td></tr>
            <tr><td><code>footer</code></td><td><code>ReactNode</code></td><td>—</td></tr>
            <tr><td><code>mainClassName</code></td><td><code>string</code></td><td>—</td></tr>
          </tbody>
        </table>
      </section>

      {/* ─── SEOHead ────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">SEO / Head</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Dual API for SEO meta tags: React <code className="docs-props-table code">&lt;SEOHead&gt;</code> component for SPAs, and <code className="docs-props-table code">generateSEOTags()</code> utility for Astro/SSR.
        </p>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <div>
              <span className="mb-2 block font-mono text-xs font-bold tracking-widest text-accent uppercase">React (SPA)</span>
              <pre className="docs-code" style={{ display: 'block', padding: 16 }}>
{`<SEOHead
  title="Cloud Cost Dashboard"
  description="Monitor multi-cloud spending."
  url="https://cloudcost.kongmy.dev"
  image="https://kongmy.dev/og-cloudcost.png"
  siteName="KONGMY"
  type="website"
/>`}
              </pre>
            </div>
            <div>
              <span className="mb-2 block font-mono text-xs font-bold tracking-widest text-accent uppercase">Astro / SSR</span>
              <pre className="docs-code" style={{ display: 'block', padding: 16 }}>
{`---
import { generateSEOTags } from '@kongmy-dev/sapphire-ui';
const seo = generateSEOTags({
  title: 'My Blog Post',
  description: 'A deep dive into...',
  type: 'article',
  publishedTime: '2024-01-15',
  author: 'Kong MY',
});
---
<head>
  <Fragment set:html={seo} />
</head>`}
              </pre>
            </div>
          </div>
        </div>

        <table className="docs-props-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>title</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>description</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>url</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>image</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>siteName</code></td><td><code>string</code></td><td><code>&quot;KONGMY&quot;</code></td></tr>
            <tr><td><code>type</code></td><td><code>website | article</code></td><td><code>website</code></td></tr>
            <tr><td><code>twitterCard</code></td><td><code>summary | summary_large_image</code></td><td><code>summary_large_image</code></td></tr>
            <tr><td><code>publishedTime</code></td><td><code>string (ISO)</code></td><td>—</td></tr>
            <tr><td><code>jsonLd</code></td><td><code>Record</code></td><td>—</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
