import { Stat } from './stat.js';

function StatChanges() {
  return (
    <div className="sp-cluster">
      <Stat
        label="Active users"
        value="12,438"
        change="+12%"
        changeDirection="up"
      />
      <Stat
        label="Monthly cost"
        value="$428.50"
        change="-3%"
        changeDirection="down"
      />
      <Stat
        label="Availability"
        value="99.9%"
        change="Stable"
        description="Over the last 30 days."
      />
    </div>
  );
}

function StatSizes() {
  return (
    <div className="sp-cluster">
      <Stat size="sm" label="Projects" value={8} />
      <Stat label="Members" value={24} />
      <Stat size="lg" label="Deployments" value={143} />
    </div>
  );
}

export const examples = [
  { name: 'changes', render: StatChanges },
  { name: 'sizes', render: StatSizes },
] as const;
