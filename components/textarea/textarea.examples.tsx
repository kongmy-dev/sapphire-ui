'use client';

import { useState } from 'react';
import { Card } from '../card/card.js';
import { Textarea } from './textarea.js';

function TextareaVariants() {
  return (
    <div className="docs-textarea-demo sp-stack">
      <Textarea aria-label="Default textarea" placeholder="Default" />
      <Textarea
        variant="mono"
        aria-label="Monospace textarea"
        placeholder="Monospace"
      />
      <Card variant="dark">
        <Textarea
          variant="on-dark"
          aria-label="On dark textarea"
          placeholder="On dark"
        />
      </Card>
    </div>
  );
}

function TextareaSizes() {
  return (
    <div className="docs-textarea-demo sp-stack">
      <Textarea size="sm" aria-label="Small textarea" placeholder="Small" />
      <Textarea aria-label="Regular textarea" placeholder="Regular" />
      <Textarea size="lg" aria-label="Large textarea" placeholder="Large" />
    </div>
  );
}

function TextareaStates() {
  return (
    <div className="docs-textarea-demo sp-stack">
      <Textarea
        disabled
        aria-label="Disabled textarea"
        defaultValue="Unavailable"
      />
      <Textarea
        readOnly
        aria-label="Read only textarea"
        defaultValue="Read only"
      />
      <Textarea
        aria-invalid="true"
        aria-label="Invalid textarea"
        aria-describedby="textarea-example-error"
      />
      <p id="textarea-example-error">Check this value.</p>
      <Textarea aria-busy="true" aria-label="Busy textarea" />
    </div>
  );
}

function TextareaControlled() {
  const [value, setValue] = useState('');
  return (
    <div className="docs-textarea-demo sp-stack">
      <Textarea
        rows={3}
        aria-label="Controlled textarea"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <output>{value || 'Empty'}</output>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: TextareaVariants },
  { name: 'sizes', render: TextareaSizes },
  { name: 'states', render: TextareaStates },
  { name: 'controlled', render: TextareaControlled },
] as const;
