'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select.js';

function SelectOptions() {
  return (
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Plans</SelectLabel>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
      </SelectGroup>
      <SelectSeparator />
      <SelectItem value="enterprise" disabled>
        Enterprise
      </SelectItem>
    </SelectContent>
  );
}

function SelectStates() {
  return (
    <div className="sp-stack">
      <Select defaultValue="free">
        <SelectTrigger aria-label="Default plan">
          <SelectValue />
        </SelectTrigger>
        <SelectOptions />
      </Select>
      <Select disabled defaultValue="pro">
        <SelectTrigger size="sm" aria-label="Unavailable plan">
          <SelectValue />
        </SelectTrigger>
        <SelectOptions />
      </Select>
      <Select>
        <SelectTrigger size="lg" aria-label="Choose a plan">
          <SelectValue placeholder="Choose a plan" />
        </SelectTrigger>
        <SelectOptions />
      </Select>
    </div>
  );
}

function SelectControlled() {
  const [plan, setPlan] = useState('free');
  return (
    <div className="sp-stack">
      <Select value={plan} onValueChange={setPlan}>
        <SelectTrigger aria-label="Controlled plan">
          <SelectValue />
        </SelectTrigger>
        <SelectOptions />
      </Select>
      <output>{plan}</output>
    </div>
  );
}

export const examples = [
  { name: 'states', render: SelectStates },
  { name: 'controlled', render: SelectControlled },
] as const;
