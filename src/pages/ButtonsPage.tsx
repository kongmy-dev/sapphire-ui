import { Button, type ButtonProps } from '../components/ui/Button';

type Variant = NonNullable<ButtonProps['variant']>;
const variants: readonly Variant[] = ['primary', 'outline', 'ghost', 'accent', 'on-dark-primary', 'on-dark-outline', 'link', 'premium'] as const;
const sizes = ['sm', 'default', 'lg'] as const;
const showcaseVariants: readonly Variant[] = ['primary', 'outline', 'ghost', 'accent', 'link'];

export default function ButtonsPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Buttons</h1>
        <p>Interactive buttons with CVA variants. Uses Radix Slot for polymorphic rendering via asChild.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Variants</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            {showcaseVariants.map((v) => (
              <Button key={v} variant={v}>{v}</Button>
            ))}
          </div>
        </div>
        <div className="docs-preview docs-preview--dark" style={{ marginTop: 12 }}>
          <div className="docs-flex">
            <Button variant="on-dark-primary">On Dark Primary</Button>
            <Button variant="on-dark-outline">On Dark Outline</Button>
            <Button variant="premium">Premium</Button>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Sizes</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ alignItems: 'center' }}>
            {sizes.map((s) => (
              <Button key={s} size={s}>Size {s}</Button>
            ))}
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">With Icon</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            <Button icon="arrow_forward">Continue</Button>
            <Button variant="outline" icon="cloud">Deploy</Button>
            <Button variant="ghost" icon="smart_toy">AI Assist</Button>
            <Button size="icon" variant="outline" icon="settings" aria-label="Settings" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">States</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            <Button loading>Loading...</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">As Link (asChild)</h2>
        <div className="docs-preview">
          <Button variant="outline" asChild>
            <a href="https://kongmy.dev" target="_blank" rel="noopener noreferrer">
              Visit kongmy.dev →
            </a>
          </Button>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Props</h2>
        <table className="docs-props-table">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>{variants.join(' | ')}</code></td><td><code>primary</code></td></tr>
            <tr><td><code>size</code></td><td><code>{sizes.join(' | ')} | icon</code></td><td><code>default</code></td></tr>
            <tr><td><code>asChild</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
            <tr><td><code>icon</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
