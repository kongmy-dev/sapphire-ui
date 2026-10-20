'use client';

import { Button } from '../button/button.js';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet.js';

function SheetSettings() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open workspace settings</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Workspace settings</SheetTitle>
          <SheetDescription>
            Manage your workspace preferences.
          </SheetDescription>
        </SheetHeader>
        <label>
          Workspace name
          <input defaultValue="Sapphire" />
        </label>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Save workspace</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SheetBottom() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open notifications</Button>
      </SheetTrigger>
      <SheetContent side="bottom" hideClose>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>You are up to date.</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const examples = [
  { name: 'settings', render: SheetSettings },
  { name: 'bottom', render: SheetBottom },
] as const;
