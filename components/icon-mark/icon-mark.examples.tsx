import { IconMark } from './icon-mark.js';

function IconMarkSizes() {
  const icon = (
    <svg
      className="sp-icon"
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
  return (
    <div className="sp-cluster">
      <IconMark size="sm" icon={icon} />
      <IconMark icon={icon} />
      <IconMark size="lg" icon={icon} />
    </div>
  );
}
function IconMarkOnDark() {
  return (
    <IconMark
      variant="on-dark"
      icon={
        <svg
          className="sp-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m12 3 3 6 6 1-4.5 4.5 1 6.5-5.5-3-5.5 3 1-6.5L3 10l6-1Z" />
        </svg>
      }
    />
  );
}
export const examples = [
  { name: 'sizes', render: IconMarkSizes },
  { name: 'on-dark', render: IconMarkOnDark },
] as const;
