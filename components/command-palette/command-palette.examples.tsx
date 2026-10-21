'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import { type CommandItem, CommandPalette } from './command-palette.js';

function CommandNavigation() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('No command');
  const items = [
    {
      id: 'projects',
      label: 'Open projects',
      hint: '/projects',
      onSelect: (query: string) => setSelected(`Projects: ${query}`),
      icon: (
        <svg
          className="sp-icon"
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M3 7h18v14H3zM7 7V3h10v4" />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Open settings',
      hint: '/settings',
      onSelect: () => setSelected('Settings'),
    },
  ] satisfies CommandItem[];
  return (
    <div className="sp-cluster">
      <Button onClick={() => setOpen(true)}>Search navigation</Button>
      <CommandPalette items={items} open={open} onOpenChange={setOpen} />
      <output>{selected}</output>
    </div>
  );
}

function CommandActions() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('No action');
  return (
    <div className="sp-cluster">
      <Button onClick={() => setOpen(true)}>Search actions</Button>
      <CommandPalette
        placeholder="Find an action…"
        items={[
          {
            id: 'save',
            label: 'Save draft',
            onSelect: () => setSelected('Draft saved'),
          },
          {
            id: 'publish',
            label: 'Publish document',
            onSelect: () => setSelected('Document published'),
          },
        ]}
        open={open}
        onOpenChange={setOpen}
      />
      <output>{selected}</output>
    </div>
  );
}

export const examples = [
  { name: 'navigation', render: CommandNavigation },
  { name: 'actions', render: CommandActions },
] as const;
