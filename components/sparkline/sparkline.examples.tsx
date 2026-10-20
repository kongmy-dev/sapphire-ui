import { Sparkline, type SparklineDataPoint } from './sparkline.js';

function SparklineHealth() {
  const data = [
    { status: 'success', tooltip: 'Monday operational' },
    { status: 'warning', tooltip: 'Tuesday degraded' },
    { status: 'error', tooltip: 'Wednesday outage' },
    { status: 'neutral', tooltip: 'Thursday no data' },
    { status: 'success', tooltip: 'Friday operational' },
  ] satisfies SparklineDataPoint[];
  return <Sparkline aria-label="Service health this week" data={data} />;
}

function SparklineHealthy() {
  return (
    <Sparkline
      aria-label="Recent checks"
      data={[
        { status: 'success' },
        { status: 'success' },
        { status: 'success' },
      ]}
      height="var(--space-5)"
    />
  );
}

export const examples = [
  { name: 'health', render: SparklineHealth },
  { name: 'healthy', render: SparklineHealthy },
] as const;
