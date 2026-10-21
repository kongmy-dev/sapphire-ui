'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import { Input } from '../input/input.js';
import { Label } from '../label/label.js';
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
      <PopoverContent className="sp-stack" aria-label="Display settings">
        <h3>Display settings</h3>
        <div className="sp-stack" data-size="sm">
          <Label htmlFor="popover-name">Display name</Label>
          <Input id="popover-name" defaultValue="Alex" />
        </div>
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
