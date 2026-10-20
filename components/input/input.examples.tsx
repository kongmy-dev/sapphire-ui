'use client';

import { useState } from 'react';
import { Card } from '../card/card.js';
import { Input } from './input.js';

function InputVariants() {
  return (
    <div className="docs-input-demo sp-stack">
      <Input aria-label="Default input" placeholder="Default" />
      <Input
        variant="mono"
        aria-label="Monospace input"
        placeholder="Monospace"
      />
      <Card variant="dark">
        <Input
          variant="on-dark"
          aria-label="On dark input"
          placeholder="On dark"
        />
      </Card>
    </div>
  );
}

function InputSizes() {
  return (
    <div className="docs-input-demo sp-stack">
      <Input size="sm" aria-label="Small input" placeholder="Small" />
      <Input aria-label="Regular input" placeholder="Regular" />
      <Input size="lg" aria-label="Large input" placeholder="Large" />
    </div>
  );
}

function InputStates() {
  return (
    <div className="docs-input-demo sp-stack">
      <Input disabled aria-label="Disabled input" defaultValue="Unavailable" />
      <Input readOnly aria-label="Read only input" defaultValue="Read only" />
      <Input
        aria-invalid="true"
        aria-label="Invalid input"
        aria-describedby="input-example-error"
      />
      <p id="input-example-error">Check this value.</p>
      <Input aria-busy="true" aria-label="Busy input" />
    </div>
  );
}

function InputControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="docs-input-demo sp-stack">
      <Input
        type="email"
        aria-label="Controlled input"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <output>{value || 'Empty'}</output>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: InputVariants },
  { name: 'sizes', render: InputSizes },
  { name: 'states', render: InputStates },
  { name: 'controlled', render: InputControlled },
] as const;
