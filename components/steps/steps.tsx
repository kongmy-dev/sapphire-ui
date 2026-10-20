import type { ComponentProps, ReactNode } from 'react';

const variants = ['default', 'compact'] as const;
const statuses = ['done', 'active', 'upcoming'] as const;
type StepStatus = (typeof statuses)[number];
export type StepItem = { label: string; description?: string | undefined };
export type StepsProps = ComponentProps<'nav'> & {
  steps: StepItem[];
  current: number;
  variant?: (typeof variants)[number] | undefined;
  renderIndicator?:
    | ((index: number, status: StepStatus) => ReactNode)
    | undefined;
};

function status(index: number, current: number): StepStatus {
  if (index < current) return 'done';
  return index === current ? 'active' : 'upcoming';
}

function Indicator({ index, state }: { index: number; state: StepStatus }) {
  return (
    <div className="sp-steps-indicator" aria-hidden="true">
      {state === 'done' ? (
        <svg
          aria-hidden="true"
          className="sp-icon sp-steps-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        index + 1
      )}
    </div>
  );
}

export function Steps({
  className,
  steps,
  current,
  variant = 'default',
  renderIndicator,
  ...props
}: StepsProps) {
  return (
    <nav
      aria-label="Progress"
      {...props}
      className={['sp-steps', className].filter(Boolean).join(' ')}
      data-slot="steps"
      data-variant={variant}
    >
      <ol className="sp-steps-list">
        {steps.map((step, index) => {
          const state = status(index, current);
          return (
            <li
              key={`step-${index}`}
              className="sp-steps-step"
              data-status={state === 'upcoming' ? undefined : state}
              aria-current={state === 'active' ? 'step' : undefined}
            >
              {renderIndicator ? (
                renderIndicator(index, state)
              ) : (
                <Indicator index={index} state={state} />
              )}
              <div className="sp-steps-text">
                <span className="sp-steps-label">{step.label}</span>
                {step.description && variant === 'default' && (
                  <span className="sp-steps-description">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
