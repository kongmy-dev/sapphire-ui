import { Spinner } from './spinner.js';

function SpinnerSizes() {
  return (
    <div className="sp-cluster">
      <Spinner size="sm" label="Loading small preview" />
      <Spinner />
      <Spinner size="lg" label="Loading large preview" />
    </div>
  );
}

function SpinnerTones() {
  return (
    <div className="sp-cluster">
      <Spinner tone="muted" label="Loading muted preview" />
      <Spinner tone="brand" label="Loading featured preview" />
    </div>
  );
}

export const examples = [
  { name: 'sizes', render: SpinnerSizes },
  { name: 'tones', render: SpinnerTones },
] as const;
