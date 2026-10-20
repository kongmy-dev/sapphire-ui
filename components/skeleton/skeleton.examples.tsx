import { Skeleton } from './skeleton.js';

function SkeletonLines() {
  return (
    <div className="sp-stack" role="status" aria-label="Loading content">
      <Skeleton size="sm" />
      <Skeleton />
      <Skeleton size="lg" />
    </div>
  );
}

function SkeletonShapes() {
  return (
    <div className="sp-stack" role="status" aria-label="Loading profile">
      <Skeleton variant="circle" />
      <Skeleton variant="card" />
    </div>
  );
}

export const examples = [
  { name: 'lines', render: SkeletonLines },
  { name: 'shapes', render: SkeletonShapes },
] as const;
