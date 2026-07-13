// Smoke consumer: imports a vendored registry component via the `@/` alias and
// renders it. tsc type-checks ALL vendored components under app/ (see tsconfig
// `include`); this entry drives the Tailwind build so verify-consumer.ts can
// assert Sapphire tokens generate utilities.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import './index.css';

function App() {
  return (
    <div className="bg-background text-foreground">
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Accent</Button>
      {/* exercise non-coinciding shadcn aliases (heavily used by consumers) */}
      <p className="text-muted-foreground">Muted</p>
      <nav className="bg-sidebar text-sidebar-foreground">Sidebar</nav>
    </div>
  );
}

const el = document.getElementById('root');
if (el) {
  createRoot(el).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
