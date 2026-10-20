'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import {
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog.js';

function DialogUncontrolled() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>Update your public profile.</DialogDescription>
          <label>
            Display name
            <input defaultValue="Alex" />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open controlled dialog</Button>
      </DialogTrigger>
      <DialogContent maxWidth="520px" closeLabel="Tutup">
        <DialogHeader>
          <DialogTitle>Controlled dialog</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            Application state controls this dialog.
          </DialogDescription>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogWithoutClose() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open without close icon</Button>
      </DialogTrigger>
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle>Review details</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            Use the action below or Escape to close.
          </DialogDescription>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Return</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogConfirmation() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Confirm archive</Button>
      <output>{confirmed ? 'Archived' : 'Not archived'}</output>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Archive project?"
        message="You can restore this project later."
        confirmLabel="Archive"
        onConfirm={() => setConfirmed(true)}
      >
        <p>Project: Sapphire</p>
      </ConfirmDialog>
    </>
  );
}

function DialogDestructive() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('No action');
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Confirm deletion
      </Button>
      <output>{status}</output>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete project?"
        message="This action cannot be undone."
        confirmLabel="Delete project"
        cancelLabel="Keep project"
        isDanger
        onConfirm={() => setStatus('Deleted')}
        onCancel={() => setStatus('Kept')}
      />
    </>
  );
}

export const examples = [
  { name: 'uncontrolled', render: DialogUncontrolled },
  { name: 'controlled', render: DialogControlled },
  { name: 'without-close', render: DialogWithoutClose },
  { name: 'confirmation', render: DialogConfirmation },
  { name: 'destructive', render: DialogDestructive },
] as const;
