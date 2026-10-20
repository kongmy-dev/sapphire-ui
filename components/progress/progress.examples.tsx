import { Progress } from './progress.js';

function ProgressValues() {
  return (
    <div className="sp-stack">
      <Progress value={25} aria-label="Upload progress" showLabel />
      <Progress value={100} aria-label="Completed upload" showLabel />
      <Progress value={null} aria-label="Preparing upload" showLabel />
    </div>
  );
}

function ProgressSizes() {
  return (
    <div className="sp-stack">
      <Progress value={30} size="sm" aria-label="Small progress" />
      <Progress value={60} aria-label="Default progress" />
      <Progress value={90} size="lg" aria-label="Large progress" />
    </div>
  );
}

export const examples = [
  { name: 'values', render: ProgressValues },
  { name: 'sizes', render: ProgressSizes },
] as const;
