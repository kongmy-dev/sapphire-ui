import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface StepItem {
  /** Short label displayed under/beside the step indicator. */
  label: string;
  /** Optional description below the label. */
  description?: string;
}

export interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of step definitions. */
  steps: StepItem[];
  /** Zero-based index of the currently active step. */
  current: number;
  /** Visual variant. */
  variant?: 'default' | 'compact';
  /** Render custom content for each step indicator. */
  renderIndicator?: (index: number, status: 'done' | 'active' | 'upcoming') => ReactNode;
}

function getStatus(index: number, current: number): 'done' | 'active' | 'upcoming' {
  if (index < current) return 'done';
  if (index === current) return 'active';
  return 'upcoming';
}

/**
 * Linear step indicator for multi-step wizards and onboarding flows.
 * Renders a horizontal progress bar with numbered/labelled steps.
 *
 * ```tsx
 * <Steps
 *   steps={[
 *     { label: 'Workspace' },
 *     { label: 'Accounts' },
 *     { label: 'Projects' },
 *   ]}
 *   current={1}
 * />
 * ```
 */
const Steps = forwardRef<HTMLDivElement, StepsProps>(
  ({ className, steps, current, variant = 'default', renderIndicator, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label="Progress"
        className={cn('flex w-full font-sans', className)}
        {...props}
      >
        <ol className="flex w-full gap-0 list-none m-0 p-0">
          {steps.map((step, index) => {
            const status = getStatus(index, current);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={index}
                className={cn(
                  'flex-1 flex flex-col items-center text-center relative',
                  variant === 'compact' && 'gap-1',
                  variant === 'default' && 'gap-2',
                )}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute top-3.5 h-[2px]',
                      'left-[calc(50%+16px)] right-[calc(-50%+16px)]',
                      status === 'done'
                        ? 'bg-[var(--color-primary)]'
                        : 'bg-[var(--color-border)]',
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Indicator */}
                <div className="relative z-10">
                  {renderIndicator ? (
                    renderIndicator(index, status)
                  ) : (
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold font-mono transition-colors',
                        status === 'done' &&
                          'bg-[var(--color-primary)] text-white',
                        status === 'active' &&
                          'bg-[var(--color-accent)] text-[var(--color-primary)] ring-4 ring-[rgba(197,160,101,0.18)]',
                        status === 'upcoming' &&
                          'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
                      )}
                    >
                      {status === 'done' ? (
                        <span
                          className="material-symbols-outlined text-[16px]"
                          aria-hidden="true"
                        >
                          check
                        </span>
                      ) : (
                        index + 1
                      )}
                    </div>
                  )}
                </div>

                {/* Label & Description */}
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider transition-colors',
                      status === 'done' && 'text-[var(--color-text-strong)]',
                      status === 'active' && 'text-[var(--color-accent-text,var(--color-accent))]',
                      status === 'upcoming' && 'text-[var(--color-text-muted)]',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && variant === 'default' && (
                    <span className="text-[11px] text-[var(--color-text-muted)] leading-tight">
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
  },
);
Steps.displayName = 'Steps';

export { Steps };
