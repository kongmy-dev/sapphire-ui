'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import { WizardLayout } from './wizard-layout.js';

const steps = [{ label: 'Workspace' }, { label: 'Review' }];

function WizardInline() {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  return (
    <>
      <WizardLayout
        steps={steps}
        currentStep={step}
        title="Create workspace"
        description="Complete both steps."
        onNext={() => setStep(1)}
        onPrev={() => setStep(0)}
        onFinish={() => setFinished(true)}
      >
        <p>
          {step === 0
            ? 'Choose your workspace settings.'
            : 'Review your workspace settings.'}
        </p>
      </WizardLayout>
      <output>{finished ? 'Workspace created' : 'In progress'}</output>
    </>
  );
}

function WizardModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open setup wizard</Button>
      <WizardLayout
        mode="modal"
        isOpen={open}
        onOpenChange={setOpen}
        steps={steps}
        currentStep={step}
        title="Setup wizard"
        onNext={() => setStep(1)}
        onPrev={() => setStep(0)}
        onFinish={() => setOpen(false)}
      >
        <p>Step {step + 1} of setup.</p>
      </WizardLayout>
    </>
  );
}

export const examples = [
  { name: 'inline', render: WizardInline },
  { name: 'modal', render: WizardModal },
] as const;
