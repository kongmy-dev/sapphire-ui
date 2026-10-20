'use client';

import { type ComponentProps, type ReactNode, useRef } from 'react';
import { Button } from '../button/button.js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../dialog/dialog.js';
import { type StepItem, Steps } from '../steps/steps.js';

const modes = ['inline', 'fullscreen', 'modal'] as const;
export type WizardLayoutProps = Omit<ComponentProps<'div'>, 'title'> & {
  mode?: (typeof modes)[number] | undefined;
  steps: StepItem[];
  currentStep: number;
  title?: string | undefined;
  description?: string | undefined;
  isOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  onNext?: (() => void) | undefined;
  onPrev?: (() => void) | undefined;
  onFinish?: (() => void) | undefined;
  isNextDisabled?: boolean | undefined;
  isPrevDisabled?: boolean | undefined;
  isFinishDisabled?: boolean | undefined;
  nextLabel?: ReactNode;
  prevLabel?: ReactNode;
  finishLabel?: ReactNode;
  children: ReactNode;
};

function WizardContent({
  steps,
  currentStep,
  title,
  description,
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
}: WizardLayoutProps) {
  return (
    <>
      <div className="sp-wizard-layout-header">
        <div className="sp-wizard-layout-header-inner">
          {title && <h2 className="sp-wizard-layout-title">{title}</h2>}
          {description && (
            <p className="sp-wizard-layout-description">{description}</p>
          )}
          <Steps steps={steps} current={currentStep} />
        </div>
      </div>
      <div className="sp-wizard-layout-content">
        <div className="sp-wizard-layout-body">{children}</div>
        <div className="sp-wizard-layout-footer">
          <Button
            variant="outline"
            type="button"
            onClick={onPrev}
            disabled={isPrevDisabled || currentStep === 0}
          >
            {prevLabel}
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              type="button"
              onClick={onFinish}
              disabled={isFinishDisabled}
            >
              {finishLabel}
            </Button>
          ) : (
            <Button type="button" onClick={onNext} disabled={isNextDisabled}>
              {nextLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

export function WizardLayout({
  className,
  mode = 'inline',
  isOpen,
  onOpenChange,
  ref,
  steps,
  currentStep,
  title,
  description,
  onNext,
  onPrev,
  onFinish,
  isNextDisabled,
  isPrevDisabled,
  isFinishDisabled,
  nextLabel,
  prevLabel,
  finishLabel,
  children,
  ...props
}: WizardLayoutProps) {
  const launcher = useRef<HTMLElement | null>(null);
  const content = (
    <WizardContent
      steps={steps}
      currentStep={currentStep}
      title={title}
      description={description}
      onNext={onNext}
      onPrev={onPrev}
      onFinish={onFinish}
      isNextDisabled={isNextDisabled}
      isPrevDisabled={isPrevDisabled}
      isFinishDisabled={isFinishDisabled}
      nextLabel={nextLabel}
      prevLabel={prevLabel}
      finishLabel={finishLabel}
    >
      {children}
    </WizardContent>
  );
  const classes = ['sp-wizard-layout', className].filter(Boolean).join(' ');
  if (mode === 'modal')
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          {...props}
          ref={ref}
          className={classes}
          data-mode={mode}
          onOpenAutoFocus={() => {
            const active = document.activeElement;
            launcher.current = active instanceof HTMLElement ? active : null;
          }}
          onCloseAutoFocus={(event) => {
            if (launcher.current?.isConnected) {
              event.preventDefault();
              launcher.current.focus();
            }
          }}
        >
          <div className="sp-sr-only">
            <DialogTitle>{title || 'Wizard Modal'}</DialogTitle>
            <DialogDescription>
              {description || 'Follow the steps to complete.'}
            </DialogDescription>
          </div>
          {content}
        </DialogContent>
      </Dialog>
    );
  return (
    <div
      {...props}
      ref={ref}
      className={classes}
      data-slot="wizard-layout"
      data-mode={mode}
    >
      {content}
    </div>
  );
}
