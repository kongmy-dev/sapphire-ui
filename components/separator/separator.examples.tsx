import { Separator } from './separator.js';

function SeparatorHorizontal() {
  return (
    <div className="sp-stack">
      <p>First section</p>
      <Separator decorative={false} />
      <p>Second section</p>
    </div>
  );
}

function SeparatorVertical() {
  return (
    <div className="sp-cluster" style={{ height: 'var(--space-8)' }}>
      <a href="#overview">Overview</a>
      <Separator orientation="vertical" />
      <a href="#details">Details</a>
    </div>
  );
}

export const examples = [
  { name: 'horizontal', render: SeparatorHorizontal },
  { name: 'vertical', render: SeparatorVertical },
] as const;
