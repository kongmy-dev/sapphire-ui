'use client';

import { useState } from 'react';
import { Checkbox } from './checkbox.js';

function CheckboxStates() {
  return (
    <div className="sp-stack">
      <Checkbox
        label="Accept terms"
        description="Read the terms before continuing."
      />
      <Checkbox label="Receive updates" defaultChecked />
      <Checkbox label="Partial selection" defaultChecked="indeterminate" />
      <Checkbox label="Unavailable option" disabled />
    </div>
  );
}

function CheckboxControlled() {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(
    'indeterminate',
  );
  return (
    <div className="sp-stack">
      <Checkbox
        label="Select all files"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <output>{String(checked)}</output>
      <button type="button" onClick={() => setChecked('indeterminate')}>
        Reset mixed selection
      </button>
    </div>
  );
}

export const examples = [
  { name: 'states', render: CheckboxStates },
  { name: 'controlled', render: CheckboxControlled },
] as const;
