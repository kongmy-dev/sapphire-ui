'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu.js';

function DropdownActions() {
  const [action, setAction] = useState('No action');
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Project actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Project</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem inset onSelect={() => setAction('Edited')}>
              Edit<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>Archive</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setAction('Duplicated')}>
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <output>{action}</output>
    </>
  );
}

function DropdownPreferences() {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [value, setValue] = useState('comfortable');
  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button>View preferences</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>View</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={checked}
            onCheckedChange={(state) => setChecked(state === true)}
            onSelect={(event) => event.preventDefault()}
          >
            Show sidebar
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
            <DropdownMenuRadioItem value="comfortable">
              Comfortable
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="compact">
              Compact
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <output>
        {checked ? 'Sidebar visible' : 'Sidebar hidden'}; {value}
      </output>
    </>
  );
}

export const examples = [
  { name: 'actions', render: DropdownActions },
  { name: 'preferences', render: DropdownPreferences },
] as const;
