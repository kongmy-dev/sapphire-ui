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
        <ol className="m-0 flex w-full list-none gap-0 p-0">
          {steps.map((step, index) => {
            const status = getStatus(index, current);
            const isLast = index === steps.length - 1;

            return (
              <li
                key={index}
                className={cn(
                  'relative flex flex-1 flex-col items-center text-center',
                  variant === 'compact' && 'gap-1',
                  variant === 'default' && 'gap-2',
                )}
              >
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      'absolute top-3.5 h-[2px]',
                      'right-[calc(-50%+16px)] left-[calc(50%+16px)]',
                      status === 'done'
                        ? 'bg-primary'
                        : 'bg-border',
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
                        'flex size-7 items-center justify-center rounded-full font-mono text-xs font-semibold transition-colors',
                        status === 'done' &&
                          'bg-primary text-white',
                        status === 'active' &&
                          'bg-accent text-primary ring-4 ring-[rgba(197,160,101,0.18)]',
                        status === 'upcoming' &&
                          'border border-border bg-surface text-(--color-text-muted)',
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
                      'text-xs font-semibold tracking-wider uppercase transition-colors',
                      status === 'done' && 'text-(--color-text-strong)',
                      status === 'active' && 'text-(--color-accent-text,var(--color-accent))',
                      status === 'upcoming' && 'text-(--color-text-muted)',
                    )}
                  >
                    {step.label}
                  </span>
                  {step.description && variant === 'default' && (
                    <span className="text-[11px] leading-tight text-(--color-text-muted)">
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
