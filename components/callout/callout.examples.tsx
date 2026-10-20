import { Callout } from './callout.js';

function CalloutNotice() {
  return (
    <Callout
      title="Before you begin"
      icon={
        <svg
          className="sp-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx={12} cy={12} r={10} />
          <path d="M12 8h.01M12 12v4" />
        </svg>
      }
    >
      <p>
        Review the <a href="#requirements">requirements</a> before continuing.
      </p>
    </Callout>
  );
}

function CalloutSubtle() {
  return (
    <Callout variant="subtle">
      <ul>
        <li>Keep credentials private.</li>
        <li>Use a separate account.</li>
      </ul>
    </Callout>
  );
}

export const examples = [
  { name: 'notice', render: CalloutNotice },
  { name: 'subtle', render: CalloutSubtle },
] as const;
