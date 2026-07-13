// Smoke consumer: imports a vendored registry component via the `@/` alias and
// renders it. tsc type-checks ALL vendored components under app/ (see tsconfig
// `include`); this entry drives the Tailwind build so verify-consumer.ts can
// assert Sapphire tokens generate utilities.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Combobox } from '@/components/ui/combobox';
import { Toaster } from '@/components/ui/toaster';
import './index.css';

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

function App() {
  return (
    <div className="bg-background text-foreground">
      <Button variant="primary">Primary</Button>
      <Button variant="accent">Accent</Button>
      {/* exercise non-coinciding shadcn aliases (heavily used by consumers) */}
      <p className="text-muted-foreground">Muted</p>
      <nav className="bg-sidebar text-sidebar-foreground">Sidebar</nav>
      {/* exercise an admin block (Popover + Command + Button composition) */}
      <Combobox options={FRUITS} />
      <Calendar mode="single" />
      <Toaster />
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
