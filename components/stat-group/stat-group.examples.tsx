import { Stat } from '../stat/stat.js';
import { StatGroup } from './stat-group.js';

function StatGroupSummary() {
  return (
    <StatGroup>
      <Stat label="Users" value="12,438" />
      <Stat label="Revenue" value="$8,200" />
      <Stat label="Conversion" value="3.8%" />
    </StatGroup>
  );
}

function StatGroupColumns() {
  return (
    <div className="sp-stack">
      <StatGroup cols={1}>
        <Stat label="Single metric" value={42} />
      </StatGroup>
      <StatGroup cols={2}>
        <Stat label="Current" value={24} />
        <Stat label="Previous" value={21} />
      </StatGroup>
      <StatGroup cols={4}>
        <Stat label="North" value={12} />
        <Stat label="South" value={18} />
        <Stat label="East" value={15} />
        <Stat label="West" value={20} />
      </StatGroup>
    </div>
  );
}

export const examples = [
  { name: 'summary', render: StatGroupSummary },
  { name: 'columns', render: StatGroupColumns },
] as const;
