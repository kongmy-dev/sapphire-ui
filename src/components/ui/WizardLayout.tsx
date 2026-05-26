import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Steps, type StepItem } from './Steps';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './Dialog';
import { Button } from './Button';

export interface WizardLayoutProps extends HTMLAttributes<HTMLDivElement> {
  mode?: 'inline' | 'fullscreen' | 'modal';
  steps: StepItem[];
  currentStep: number;
  title?: string;
  description?: string;
  isOpen?: boolean; // For modal mode
  onOpenChange?: (open: boolean) => void; // For modal mode
  onNext?: () => void;
  onPrev?: () => void;
  onFinish?: () => void;
  isNextDisabled?: boolean;
  isPrevDisabled?: boolean;
  isFinishDisabled?: boolean;
  nextLabel?: ReactNode;
  prevLabel?: ReactNode;
  finishLabel?: ReactNode;
  children: ReactNode;
}

const WizardLayout = forwardRef<HTMLDivElement, WizardLayoutProps>(
  (
    {
      className,
      mode = 'inline',
      steps,
      currentStep,
      title,
      description,
      isOpen,
      onOpenChange,
      onNext,
      onPrev,
      onFinish,
      isNextDisabled,
      isPrevDisabled,
      isFinishDisabled,
      nextLabel = 'Next',
      prevLabel = 'Back',
      finishLabel = 'Finish',
      children,
      ...props
    },
    ref
  ) => {
    const isLastStep = currentStep === steps.length - 1;

    const Footer = (
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-surface/50 px-6 py-4">
        <Button variant="outline" onClick={onPrev} disabled={isPrevDisabled || currentStep === 0}>
          {prevLabel}
        </Button>
        {isLastStep ? (
          <Button variant="primary" onClick={onFinish} disabled={isFinishDisabled}>
            {finishLabel}
          </Button>
        ) : (
          <Button variant="primary" onClick={onNext} disabled={isNextDisabled}>
            {nextLabel}
          </Button>
        )}
      </div>
    );

    const Header = (
      <div className="shrink-0 border-b border-border bg-surface p-6">
        <div className="mx-auto w-full max-w-3xl">
          {title && <h2 className="mb-2 font-serif text-xl font-semibold tracking-tight">{title}</h2>}
          {description && <p className="mb-8 text-sm text-(--color-text-muted)">{description}</p>}
          <Steps steps={steps} current={currentStep} />
        </div>
      </div>
    );

    const ContentArea = (
      <div className="bg-background flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {Footer}
      </div>
    );

    if (mode === 'modal') {
      return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-[800px] flex-col gap-0 overflow-hidden p-0">
            <div className="sr-only">
              <DialogTitle>{title || 'Wizard Modal'}</DialogTitle>
              <DialogDescription>{description || 'Follow the steps to complete.'}</DialogDescription>
            </div>
            {Header}
            {ContentArea}
          </DialogContent>
        </Dialog>
      );
    }

    if (mode === 'fullscreen') {
      return (
        <div
          ref={ref}
          className={cn('bg-background fixed inset-0 z-50 flex flex-col font-sans', className)}
          {...props}
        >
          {Header}
          {ContentArea}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-background flex min-h-[500px] flex-col overflow-hidden rounded-md border border-border font-sans',
          className
        )}
        {...props}
      >
        {Header}
        {ContentArea}
      </div>
    );
  }
);
WizardLayout.displayName = 'WizardLayout';

export { WizardLayout };
