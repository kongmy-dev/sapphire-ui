import { Alert } from './alert.js';

function StatusAlerts() {
  return (
    <>
      <Alert title="Information">Your changes are saved automatically.</Alert>
      <Alert variant="success" title="Saved">
        All changes have been saved.
      </Alert>
      <Alert variant="warning" title="Storage nearly full">
        Archive unused files.
      </Alert>
      <Alert variant="error" title="Connection lost">
        Try again when you are online.
      </Alert>
    </>
  );
}
function BrandAlert() {
  return (
    <Alert variant="brand" title="Tip">
      Keep your recovery codes in a safe place.
    </Alert>
  );
}
function CustomIconAlert() {
  return (
    <Alert
      icon={
        <svg aria-hidden="true" className="sp-icon" viewBox="0 0 24 24">
          <path d="M12 3v18M3 12h18" fill="none" stroke="currentColor" />
        </svg>
      }
    >
      Add your first project to get started.
    </Alert>
  );
}
export const examples = [
  { name: 'statuses', render: StatusAlerts },
  { name: 'brand', render: BrandAlert },
  { name: 'custom-icon', render: CustomIconAlert },
] as const;
