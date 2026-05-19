import { useState, useEffect } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { Spinner } from '../components/ui/Spinner';
import { Progress } from '../components/ui/Progress';
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
            <Spinner style={{ color: 'var(--color-accent)' }} />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Progress</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <Progress value={progress} showLabel />
            <Progress value={75} size="sm" />
            <Progress value={100} size="lg" showLabel />
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
    </div>
  );
}
