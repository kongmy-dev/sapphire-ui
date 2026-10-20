'use client';

import { useState } from 'react';
import { Switch, ToggleSwitch } from './switch.js';

function SwitchStates() {
  return (
    <div className="sp-stack">
      <Switch label="Enable analytics" />
      <Switch label="Marketing emails" defaultChecked />
      <Switch label="Compact switch" size="sm" defaultChecked />
      <Switch label="Unavailable switch" disabled />
      <Switch label="Locked enabled switch" disabled defaultChecked />
    </div>
  );
}

function SwitchControlled() {
  const [checked, setChecked] = useState(false);
  return (
    <div className="sp-stack">
      <ToggleSwitch
        label="Live notifications"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <output>{checked ? 'Enabled' : 'Disabled'}</output>
    </div>
  );
}

export const examples = [
  { name: 'states', render: SwitchStates },
  { name: 'controlled', render: SwitchControlled },
] as const;
