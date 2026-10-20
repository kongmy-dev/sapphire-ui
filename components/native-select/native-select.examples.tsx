'use client';

import { useState } from 'react';
import { Card } from '../card/card.js';
import { NativeSelect } from './native-select.js';

function SelectVariants() {
  return (
    <div className="docs-native-select-demo sp-stack">
      <NativeSelect aria-label="Default plan">
        <option>Free</option>
        <option>Pro</option>
      </NativeSelect>
      <Card variant="dark">
        <NativeSelect variant="on-dark" aria-label="On dark plan">
          <option>Free</option>
          <option>Pro</option>
        </NativeSelect>
      </Card>
    </div>
  );
}

function SelectSizes() {
  return (
    <div className="docs-native-select-demo sp-stack">
      <NativeSelect size="sm" aria-label="Small plan">
        <option>Free</option>
      </NativeSelect>
      <NativeSelect aria-label="Regular plan">
        <option>Free</option>
      </NativeSelect>
      <NativeSelect size="lg" aria-label="Large plan">
        <option>Free</option>
      </NativeSelect>
    </div>
  );
}

function SelectStates() {
  return (
    <div className="docs-native-select-demo sp-stack">
      <NativeSelect disabled aria-label="Disabled plan">
        <option>Free</option>
      </NativeSelect>
      <NativeSelect
        aria-invalid="true"
        aria-describedby="select-example-error"
        aria-label="Invalid plan"
      >
        <option value="">Choose a plan</option>
      </NativeSelect>
      <p id="select-example-error">Choose an available plan.</p>
      <NativeSelect
        multiple
        aria-label="Multiple plans"
        defaultValue={['free']}
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </NativeSelect>
    </div>
  );
}

function SelectControlled() {
  const [plan, setPlan] = useState('free');
  return (
    <div className="docs-native-select-demo sp-stack">
      <NativeSelect
        aria-label="Controlled plan"
        value={plan}
        onChange={(event) => setPlan(event.currentTarget.value)}
      >
        <option value="free">Free</option>
        <option value="pro">Pro</option>
        <option value="enterprise" disabled>
          Enterprise
        </option>
      </NativeSelect>
      <output>{plan}</output>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: SelectVariants },
  { name: 'sizes', render: SelectSizes },
  { name: 'states', render: SelectStates },
  { name: 'controlled', render: SelectControlled },
] as const;
