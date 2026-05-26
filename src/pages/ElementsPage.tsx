

export default function ElementsPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Web Components & SEO</h1>
        <p>Framework-agnostic elements and head utilities for Astro and vanilla contexts.</p>
      </header>

      {/* ─── Custom Elements: site-header / site-footer ─────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Custom Elements (Astro / vanilla HTML)</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Framework-agnostic Web Component versions of <code className="docs-props-table code">SiteHeader</code> and{' '}
          <code className="docs-props-table code">SiteFooter</code>. Same visual output — no React runtime required.
          Light-DOM elements, so consumer Tailwind utilities apply to slotted content.
          Available as <code className="docs-props-table code">@kongmy-dev/sapphire-ui/site-header-element</code> and{' '}
          <code className="docs-props-table code">@kongmy-dev/sapphire-ui/site-footer-element</code>, or both via{' '}
          <code className="docs-props-table code">@kongmy-dev/sapphire-ui/elements</code>.
        </p>

        <h3 className="mt-6 mb-2 font-serif text-lg font-semibold">Setup</h3>
        <pre className="docs-code-block"><code>{`import '@kongmy-dev/sapphire-ui/style.css';
import '@kongmy-dev/sapphire-ui/elements';`}</code></pre>

        <h3 className="mt-6 mb-2 font-serif text-lg font-semibold">Usage</h3>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          For <code className="docs-props-table code">sapphire-site-header</code>, children with{' '}
          <code className="docs-props-table code">data-slot=&quot;brand|nav|actions&quot;</code> are positioned into the layout.
          Add <code className="docs-props-table code">sticky</code> to make it sticky. For{' '}
          <code className="docs-props-table code">sapphire-site-footer</code>, slots are{' '}
          <code className="docs-props-table code">brand</code>, <code className="docs-props-table code">links</code>, and{' '}
          <code className="docs-props-table code">bottom</code>. Both elements accept{' '}
          <code className="docs-props-table code">variant=&quot;light|dark&quot;</code> to switch palette.
        </p>

        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <div>
              <span className="mb-2 block font-mono text-xs font-bold tracking-widest text-accent uppercase">Header</span>
              <pre className="docs-code" style={{ display: 'block', padding: 16 }}>
{`<sapphire-site-header variant="dark" sticky>
  <div data-slot="brand">
    <a href="/">KONGMY <span class="text-accent">dev</span></a>
  </div>
  <nav data-slot="nav">
    <a href="/" class="docs-nav-link">Home</a>
    <a href="/services" class="docs-nav-link">Services</a>
    <a href="/blog" class="docs-nav-link">Blog</a>
  </nav>
  <div data-slot="actions">
    <a class="btn btn-primary" href="/contact">Get started</a>
  </div>
</sapphire-site-header>`}
              </pre>
            </div>
            <div>
              <span className="mb-2 block font-mono text-xs font-bold tracking-widest text-accent uppercase">Footer</span>
              <pre className="docs-code" style={{ display: 'block', padding: 16 }}>
{`<sapphire-site-footer variant="dark">
  <div data-slot="brand">
    <h4>KONGMY <span class="text-accent">dev</span></h4>
    <p>Helping businesses cut costs and build software that works.</p>
  </div>
  <div data-slot="links">
    <div>
      <span>Products</span>
      <a href="/cloudcost">CloudCost</a>
      <a href="/toolbox">Web Toolbox</a>
    </div>
    <div>
      <span>Legal</span>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
  <div data-slot="bottom">
    <span>© 2026 KONGMY Digital Solutions</span>
    <span>Built with Sapphire UI</span>
  </div>
</sapphire-site-footer>`}
              </pre>
            </div>
          </div>
        </div>

        <h3 className="mt-6 mb-2 font-serif text-lg font-semibold">Attribute reference</h3>
        <table className="docs-props-table">
          <thead>
            <tr><th>Attribute</th><th>Values</th><th>Element</th><th>Effect</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><code>variant</code></td>
              <td><code>&quot;light&quot;</code> | <code>&quot;dark&quot;</code> (default)</td>
              <td>both</td>
              <td>Switches palette. Reactive — changing the attribute at runtime re-applies classes.</td>
            </tr>
            <tr>
              <td><code>sticky</code></td>
              <td>boolean (presence)</td>
              <td>header only</td>
              <td>Adds <code>position: sticky; top: 0</code>.</td>
            </tr>
            <tr>
              <td><code>role</code></td>
              <td>auto-applied</td>
              <td>both</td>
              <td>Header gets <code>banner</code>, footer gets <code>contentinfo</code>. Override by setting <code>role</code> explicitly.</td>
            </tr>
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
