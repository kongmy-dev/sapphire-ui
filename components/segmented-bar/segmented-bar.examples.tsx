import { SegmentedBar } from './segmented-bar.js';

function CapacityExample() {
  return (
    <SegmentedBar
      aria-label="Capacity: 30 percent used, 40 percent reserved, 30 percent available"
      segments={[
        { value: 30, color: 'var(--brand)' },
        { value: 40, color: 'var(--info)' },
        { value: 30, color: 'var(--success)' },
      ]}
      markers={[{ position: 80, color: 'var(--error)' }]}
    />
  );
}
function SizeExamples() {
  return (
    <>
      <SegmentedBar
        size="sm"
        aria-label="Small capacity: 60 percent used"
        segments={[{ value: 60, color: 'var(--brand)' }]}
      />
      <SegmentedBar
        size="lg"
        aria-label="Large capacity: 75 percent used"
        segments={[{ value: 75, color: 'var(--success)' }]}
      />
    </>
  );
}
function EmptyExample() {
  return <SegmentedBar segments={[]} />;
}
export const examples = [
  { name: 'capacity', render: CapacityExample },
  { name: 'sizes', render: SizeExamples },
  { name: 'empty', render: EmptyExample },
] as const;
