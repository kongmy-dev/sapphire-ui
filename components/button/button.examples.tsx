'use client';

import { ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button.js';

function ButtonVariants() {
  return (
    <div className="sp-cluster">
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="brand">Brand</Button>
      <Button variant="link">Link</Button>
      <Button variant="premium">Premium</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="destructive-outline">Delete outline</Button>
      <Button variant="destructive-ghost">Delete ghost</Button>
    </div>
  );
}

function ButtonOnDark() {
  return (
    <div className="sp-button-demo-dark sp-cluster">
      <Button variant="on-dark-primary">Get started</Button>
      <Button variant="on-dark-outline">Learn more</Button>
    </div>
  );
}

function ButtonSizes() {
  return (
    <div className="sp-cluster">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra large</Button>
    </div>
  );
}

function ButtonIcons() {
  return (
    <div className="sp-cluster">
      <Button icon={<Plus className="sp-icon" aria-hidden="true" size={20} />}>
        Add item
      </Button>
      <Button
        icon={<ArrowRight className="sp-icon" aria-hidden="true" size={20} />}
        iconPosition="end"
      >
        Continue
      </Button>
      <Button size="icon-sm" aria-label="Add small">
        <Plus className="sp-icon" aria-hidden="true" size={16} />
      </Button>
      <Button size="icon" aria-label="Add">
        <Plus className="sp-icon" aria-hidden="true" size={20} />
      </Button>
      <Button size="icon-lg" aria-label="Add large">
        <Plus className="sp-icon" aria-hidden="true" size={24} />
      </Button>
    </div>
  );
}

function ButtonStates() {
  return (
    <div className="sp-cluster">
      <Button disabled>Disabled</Button>
      <Button loading>Saving</Button>
      <Button asChild disabled>
        <a href="#disabled">Disabled link</a>
      </Button>
      <Button asChild loading>
        <a href="#loading">Loading link</a>
      </Button>
    </div>
  );
}

function ButtonLinks() {
  return (
    <div className="sp-stack">
      <Button asChild>
        <a href="#destination">Visit destination</a>
      </Button>
      <Button fullWidth>Full width</Button>
    </div>
  );
}

function ButtonDynamicDisabled() {
  const [disabled, setDisabled] = useState(false);
  return (
    <div className="sp-cluster">
      <Button
        asChild
        disabled={disabled}
        onKeyDown={(event) => {
          if (event.key.toLowerCase() === 'd') setDisabled(true);
        }}
      >
        <a href="#dynamic-destination">Disable this link with D</a>
      </Button>
      <Button
        onClick={() => setDisabled((current) => !current)}
        aria-pressed={disabled}
      >
        Toggle link disabled
      </Button>
      <a href="#next-destination">Next destination</a>
      <output>{disabled ? 'Disabled' : 'Enabled'}</output>
    </div>
  );
}

export const examples = [
  { name: 'variants', render: ButtonVariants },
  { name: 'on-dark', render: ButtonOnDark },
  { name: 'sizes', render: ButtonSizes },
  { name: 'icons', render: ButtonIcons },
  { name: 'states', render: ButtonStates },
  { name: 'links', render: ButtonLinks },
  { name: 'dynamic-disabled', render: ButtonDynamicDisabled },
] as const;
