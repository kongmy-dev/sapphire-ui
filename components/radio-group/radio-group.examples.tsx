'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './radio-group.js';

function RadioStates() {
  return (
    <RadioGroup aria-label="Available plans" defaultValue="free">
      <RadioGroupItem
        value="free"
        label="Free"
        description="For personal projects."
      />
      <RadioGroupItem
        value="pro"
        label="Pro"
        description="For growing teams."
      />
      <RadioGroupItem value="enterprise" label="Enterprise" disabled />
    </RadioGroup>
  );
}

function RadioControlled() {
  const [plan, setPlan] = useState('monthly');
  return (
    <div className="sp-stack">
      <RadioGroup
        aria-label="Billing cycle"
        value={plan}
        onValueChange={setPlan}
      >
        <RadioGroupItem value="monthly" label="Monthly" />
        <RadioGroupItem value="annual" label="Annual" />
      </RadioGroup>
      <output>{plan}</output>
    </div>
  );
}

export const examples = [
  { name: 'states', render: RadioStates },
  { name: 'controlled', render: RadioControlled },
] as const;
