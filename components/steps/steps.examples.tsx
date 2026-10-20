import { type StepItem, Steps } from './steps.js';

const steps = [
  { label: 'Workspace', description: 'Name your workspace' },
  { label: 'Accounts', description: 'Invite the team' },
  { label: 'Projects', description: 'Start your first project' },
] satisfies StepItem[];

function StepsProgress() {
  return <Steps steps={steps} current={1} />;
}

function StepsCompact() {
  return (
    <Steps
      steps={steps}
      current={2}
      variant="compact"
      renderIndicator={(index, status) => (
        <span
          className="sp-steps-indicator"
          role="img"
          aria-label={`${status} step ${index + 1}`}
        >
          {index + 1}
        </span>
      )}
    />
  );
}

export const examples = [
  { name: 'progress', render: StepsProgress },
  { name: 'compact', render: StepsCompact },
] as const;
