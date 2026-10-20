import { ThemeToggle } from './theme-toggle.js';

function ThemeToggleStandalone() {
  return (
    <div className="sp-cluster">
      <ThemeToggle />
      <ThemeToggle variant="outline" size="icon-sm" />
      <ThemeToggle disabled />
    </div>
  );
}
export const examples = [
  { name: 'standalone', render: ThemeToggleStandalone },
] as const;
