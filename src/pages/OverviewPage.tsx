import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';

const layers = [
  {
    name: 'Layer 1: CSS Design System',
    desc: 'Framework-agnostic tokens, utility classes, and component styles. Works in Astro, Angular, Vue, and vanilla HTML.',
    icon: 'palette',
    code: `import '@kongmy-dev/sapphire-ui/style.css'`,
  },
  {
    name: 'Layer 2: React Components',
    desc: 'Typed React components built on Radix UI primitives. Used in React SPAs and Astro islands.',
    icon: 'code',
    code: `import { Button, Card } from '@kongmy-dev/sapphire-ui'`,
  },
];

const categories = [
  {
    title: 'Core Primitives',
    icon: 'widgets',
    desc: 'Foundational UI building blocks — buttons, cards, badges, inputs, and more.',
    route: '/buttons',
  },
  {
    title: 'Cards',
    icon: 'cards',
    desc: 'Versatile content containers with hover states and dark modes.',
    route: '/cards',
  },
  {
    title: 'Forms & Controls',
    icon: 'input',
    desc: 'Text inputs, textareas, checkboxes, toggles, sliders, and native selects.',
    route: '/forms',
  },
  {
    title: 'Feedback',
    icon: 'notifications',
    desc: 'Loading skeletons, spinners, progress bars, alerts, and empty states.',
    route: '/feedback',
  },
  {
    title: 'Data Display',
    icon: 'table_chart',
    desc: 'Tables, tabs, badges, avatars, and separators for presenting information.',
    route: '/data',
  },
  {
    title: 'Design Tokens',
    icon: 'palette',
    desc: 'Colors, typography, spacing, shadows, and border radii — the visual DNA.',
    route: '/colors',
  },
  {
    title: 'Typography',
    icon: 'text_fields',
    desc: 'Newsreader, Source Sans 3, and JetBrains Mono — curated font stack.',
    route: '/typography',
  },
  {
    title: 'Interactive',
    icon: 'touch_app',
    desc: 'Dialogs, toasts, page sections, site headers/footers, and SEO utilities.',
    route: '/interactive',
  },
  {
    title: 'Layouts',
    icon: 'view_quilt',
    desc: 'Application shell, sidebar navigation, and full-bleed layouts.',
    route: '/layouts',
  },
  {
    title: 'Web Components',
    icon: 'code',
    desc: 'Framework-agnostic custom elements like sapphire-toast and sapphire-banner.',
    route: '/elements',
  },
  {
    title: 'Hooks & Utils',
    icon: 'function',
    desc: 'React hooks for layout, media queries, and utility functions.',
    route: '/hooks',
  },
  {
    title: 'Extended',
    icon: 'extension',
    desc: 'Complex UI components like wizards and composite interfaces.',
    route: '/extended',
  },
];

export default function OverviewPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Sapphire UI</h1>
        <p>
          A cohesive design system and React component library for the KONGMY ecosystem.
          Navy &amp; gold editorial aesthetic. Built on Tailwind CSS v4 + Radix UI.
        </p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Architecture</h2>
        <div className="docs-stack">
          {layers.map((layer) => (
            <div key={layer.name} className="docs-preview" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Icon name={layer.icon} size={24} style={{ color: 'var(--color-accent)' }} />
                <strong style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-strong)' }}>
                  {layer.name}
                </strong>
              </div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 12 }}>
                {layer.desc}
              </p>
              <code className="docs-code" style={{ display: 'block', padding: 12 }}>
                {layer.code}
              </code>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Catalog</h2>
        <div className="docs-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {categories.map((cat) => (
            <Card key={cat.title} hoverable>
              <CardBody>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Icon name={cat.icon} size={22} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 15, color: 'var(--color-text-strong)' }}>
                    {cat.title}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  {cat.desc}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Quick Start</h2>
        <div className="docs-preview" style={{ padding: 24 }}>
          <div className="docs-stack" style={{ gap: 16 }}>
            <div>
              <Badge variant="accent" style={{ marginBottom: 8 }}>Install</Badge>
              <code className="docs-code" style={{ display: 'block', padding: 12 }}>
                bun add @kongmy-dev/sapphire-ui
              </code>
            </div>
            <div>
              <Badge variant="info" style={{ marginBottom: 8 }}>React</Badge>
              <code className="docs-code" style={{ display: 'block', padding: 12 }}>
{`import { Button, Card } from '@kongmy-dev/sapphire-ui'

<Button variant="primary">Get Started</Button>`}
              </code>
            </div>
            <div>
              <Badge variant="default" style={{ marginBottom: 8 }}>CSS-only (Astro / Angular)</Badge>
              <code className="docs-code" style={{ display: 'block', padding: 12 }}>
{`import '@kongmy-dev/sapphire-ui/style.css'

<button class="btn-primary">Get Started</button>`}
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
