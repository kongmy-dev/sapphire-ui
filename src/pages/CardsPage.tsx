import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export default function CardsPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Cards</h1>
        <p>Compound card component with header, body, and footer sub-components. Supports default, dark, feature, and dashed variants.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Default Card</h2>
        <div className="docs-preview">
          <Card hoverable style={{ maxWidth: 400 }}>
            <CardHeader>
              <Badge variant="accent">New</Badge>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-strong)' }}>
                Cloud Infrastructure
              </h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: 8 }}>
                Scalable, secure cloud solutions built on AWS, GCP, and Cloudflare Workers.
              </p>
            </CardBody>
            <CardFooter>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-text-muted)' }}>
                3 projects
              </span>
              <Button variant="link" size="sm">Learn more →</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Dark Card</h2>
        <div className="docs-preview docs-preview--dark">
          <Card variant="dark" hoverable style={{ maxWidth: 400 }}>
            <CardHeader>
              <Badge variant="dark">Featured</Badge>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>
                AI-Powered Analytics
              </h3>
            </CardHeader>
            <CardBody>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-on-dark-muted)', lineHeight: 1.6, marginTop: 8 }}>
                Custom machine learning pipelines for business intelligence and cost optimization.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Bordered Card</h2>
        <div className="docs-preview">
          <Card bordered style={{ maxWidth: 400 }}>
            <CardBody>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-strong)', marginBottom: 6 }}>
                Important Note
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Cards with a left accent border are used for highlighting key information.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Dashed Card</h2>
        <div className="docs-preview">
          <Card variant="dashed" hoverable style={{ maxWidth: 400 }}>
            <CardBody>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Drop Zone
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Dashed cards are useful for empty states, drop zones, and placeholder content.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Props</h2>
        <table className="docs-props-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th></tr></thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>default | dark | feature | dashed</code></td><td><code>default</code></td></tr>
            <tr><td><code>hoverable</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
            <tr><td><code>bordered</code></td><td><code>boolean</code></td><td><code>false</code></td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
