'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { Chip } from './chip.js';

function ChipVariants() {
  return (
    <div className="sp-cluster">
      <Chip size="sm">Small</Chip>
      <Chip>Default</Chip>
      <Chip
        size="lg"
        variant="brand"
        leading={<Check className="sp-icon" size={14} aria-hidden="true" />}
      >
        Approved
      </Chip>
      <Chip variant="outline">Outline</Chip>
    </div>
  );
}

function ChipDismissible() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="sp-cluster">
      {visible ? (
        <Chip
          variant="brand"
          dismissLabel="Remove design filter"
          onDismiss={() => setVisible(false)}
        >
          Design
        </Chip>
      ) : (
        <button type="button" onClick={() => setVisible(true)}>
          Restore filter
        </button>
      )}
    </div>
  );
}

export const examples = [
  { name: 'variants', render: ChipVariants },
  { name: 'dismissible', render: ChipDismissible },
] as const;
