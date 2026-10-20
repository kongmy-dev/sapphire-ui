import { BarChart } from './bar-chart.js';

function BarChartMonthly() {
  return (
    <BarChart
      aria-label="Monthly utilization"
      data={[35, 65, 50, 85]}
      labels={['Jan', 'Feb', 'Mar', 'Apr']}
      tooltipSuffix="%"
    />
  );
}

function BarChartUnlabelled() {
  return (
    <BarChart
      aria-label="Weekly progress"
      data={[0, 25, 75, 100]}
      height="var(--space-32)"
    />
  );
}

export const examples = [
  { name: 'monthly', render: BarChartMonthly },
  { name: 'unlabelled', render: BarChartUnlabelled },
] as const;
