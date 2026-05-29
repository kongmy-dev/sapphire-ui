import { useState, useEffect } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { Spinner } from '../components/ui/Spinner';
import { Progress } from '../components/ui/Progress';
import { SegmentedBar } from '../components/ui/SegmentedBar';
import { Alert } from '../components/ui/Alert';
import { Empty } from '../components/ui/Empty';
import { Button } from '../components/ui/Button';

export default function FeedbackPage() {
  const [progress, setProgress] = useState(35);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 5));
    }, 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <header className="docs-page-header">
        <h1>Feedback</h1>
        <p>Loading states, progress indicators, alerts, and empty states.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Skeleton</h2>
        <div className="docs-preview">
          <div className="docs-stack">
            <Skeleton variant="line" size="sm" />
            <Skeleton variant="line" size="md" />
            <Skeleton variant="line" size="lg" />
            <div className="docs-flex">
              <Skeleton variant="circle" />
              <div className="docs-stack" style={{ flex: 1, gap: 8 }}>
                <Skeleton variant="line" size="sm" />
                <Skeleton variant="line" size="md" />
              </div>
            </div>
            <Skeleton variant="card" />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Spinner</h2>
        <div className="docs-preview">
          <div className="docs-flex">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" />
            <Spinner style={{ color: 'var(--color-accent-text)' }} />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Progress</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <Progress aria-label="Loading progress" value={progress} showLabel />
            <Progress aria-label="Upload progress" value={75} size="sm" />
            <Progress aria-label="Completion" value={100} size="lg" showLabel />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Segmented Bar</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 480, gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Budget allocation (compute / storage / network / other)
              </div>
              <SegmentedBar
                aria-label="Budget allocation"
                segments={[
                  { value: 45, color: 'var(--color-accent)' },
                  { value: 30, color: 'var(--color-success)' },
                  { value: 15, color: 'var(--color-warning)' },
                  { value: 10, color: 'var(--color-error)' },
                ]}
              />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Small — with target marker at 50 %
              </div>
              <SegmentedBar
                size="sm"
                aria-label="Usage with target"
                segments={[
                  { value: 62, color: 'var(--color-accent)' },
                  { value: 38, color: 'rgba(255,255,255,0.06)' },
                ]}
                markers={[{ position: 50, color: 'var(--color-text-muted)' }]}
              />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Large — single fill
              </div>
              <SegmentedBar
                size="lg"
                aria-label="Storage used"
                segments={[
                  { value: 75, color: 'var(--color-success)' },
                  { value: 25, color: 'var(--color-border)' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Alert</h2>
        <div className="docs-preview">
          <div className="docs-stack">
            <Alert variant="info" title="Information">
              This is a general informational message for the user.
            </Alert>
            <Alert variant="success" title="Success">
              Your changes have been saved successfully.
            </Alert>
            <Alert variant="warning" title="Warning">
              API usage is approaching the monthly limit.
            </Alert>
            <Alert variant="error" title="Error">
              Failed to connect to the database. Please check your credentials.
            </Alert>
            <Alert variant="accent" title="Tip">
              Use CSS variables to customize the color palette in your project.
            </Alert>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Toast</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              icon="check_circle"
              onClick={() => window.__sapphireToast?.('Changes saved successfully.', 'success')}
            >
              Success
            </Button>
            <Button
              variant="outline"
              icon="info"
              onClick={() => window.__sapphireToast?.('Syncing data in the background.', 'info')}
            >
              Info
            </Button>
            <Button
              variant="outline"
              icon="warning"
              onClick={() => window.__sapphireToast?.('API usage is approaching the limit.', 'warning')}
            >
              Warning
            </Button>
            <Button
              variant="destructive"
              icon="error"
              onClick={() => window.__sapphireToast?.('Failed to connect to the server.', 'error')}
            >
              Error
            </Button>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Empty State</h2>
        <div className="docs-preview">
          <Empty
            icon="cloud_off"
            title="No projects yet"
            description="Get started by connecting your first cloud provider account."
            action={<Button icon="add">Add Project</Button>}
          />
        </div>
      </section>
      <section className="docs-section">
        <h2 className="docs-section-title">Props</h2>
        <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Alert</h3>
        <table className="docs-props-table">
          <thead>
            <tr><th>Prop</th><th>Type</th><th>Default</th></tr>
          </thead>
          <tbody>
            <tr><td><code>variant</code></td><td><code>&apos;info&apos; | &apos;success&apos; | &apos;warning&apos; | &apos;error&apos; | &apos;accent&apos;</code></td><td><code>&apos;info&apos;</code></td></tr>
            <tr><td><code>title</code></td><td><code>string</code></td><td>—</td></tr>
            <tr><td><code>icon</code></td><td><code>string</code></td><td>—</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
