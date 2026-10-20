'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from './popover.js';

function PopoverSettings() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Open settings</Button>
      </PopoverTrigger>
      <PopoverContent aria-label="Display settings">
        <h3>Display settings</h3>
        <label>
          Display name
          <input defaultValue="Alex" />
        </label>
        <PopoverClose asChild>
          <Button>Save settings</Button>
        </PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

function PopoverControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor>
        <PopoverTrigger asChild>
          <Button>Open details</Button>
        </PopoverTrigger>
      </PopoverAnchor>
      <PopoverContent align="start" side="right" aria-label="Account details">
        <p>Account details are up to date.</p>
        <PopoverClose>Dismiss details</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}

export const examples = [
  { name: 'settings', render: PopoverSettings },
  { name: 'controlled', render: PopoverControlled },
] as const;
