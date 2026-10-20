import { expect, it, mock } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { examples } from './dialog.examples.js';
import {
  ConfirmDialog,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog.js';

function UncontrolledDialog() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>Profile details</DialogDescription>
          <label>
            Name
            <input defaultValue="Alex" />
          </label>
        </DialogBody>
        <DialogFooter>
          <DialogClose>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

it('opens an uncontrolled modal with title and description associations and closes from its action', async () => {
  const user = userEvent.setup();
  const { container } = render(<UncontrolledDialog />);
  expect(screen.queryByRole('dialog')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Open' }));
  const dialog = screen.getByRole('dialog', { name: 'Profile' });
  expect(container.contains(dialog)).toBe(false);
  const titleId = dialog.getAttribute('aria-labelledby');
  const descriptionId = dialog.getAttribute('aria-describedby');
  expect(document.getElementById(titleId ?? '')?.textContent).toBe('Profile');
  expect(document.getElementById(descriptionId ?? '')?.textContent).toBe(
    'Profile details',
  );
  expect(container.getAttribute('aria-hidden')).toBe('true');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('supports defaultOpen, Escape and controlled state changes', async () => {
  const changes = mock((_open: boolean) => {});
  const { rerender } = render(
    <Dialog defaultOpen onOpenChange={changes}>
      <DialogContent>
        <DialogTitle>Initially open</DialogTitle>
        <DialogDescription>Details</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.getByRole('dialog')).not.toBeNull();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(changes).toHaveBeenCalledWith(false);
  rerender(
    <Dialog open onOpenChange={changes}>
      <DialogContent>
        <DialogTitle>Controlled</DialogTitle>
        <DialogDescription>Details</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(changes).toHaveBeenCalledWith(false);
  expect(screen.getByRole('dialog', { name: 'Controlled' })).not.toBeNull();
  rerender(
    <Dialog open={false}>
      <DialogContent>
        <DialogTitle>Controlled</DialogTitle>
        <DialogDescription>Details</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('preserves refs, classes, native attributes, custom width and localized close labels', async () => {
  const ref = createRef<HTMLDivElement>();
  const title = createRef<HTMLHeadingElement>();
  const description = createRef<HTMLParagraphElement>();
  const header = createRef<HTMLDivElement>();
  const body = createRef<HTMLDivElement>();
  const footer = createRef<HTMLDivElement>();
  const { rerender } = render(
    <Dialog open>
      <DialogContent
        ref={ref}
        className="custom"
        maxWidth="520px"
        style={{ width: '400px' }}
        closeLabel="Tutup"
      >
        <DialogHeader ref={header} className="heading">
          <DialogTitle ref={title} className="title">
            Settings
          </DialogTitle>
        </DialogHeader>
        <DialogBody ref={body} className="body">
          <DialogDescription ref={description} className="description">
            Preferences
          </DialogDescription>
        </DialogBody>
        <DialogFooter ref={footer} className="footer">
          Actions
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  );
  const dialog = screen.getByRole('dialog');
  expect<HTMLElement | null>(ref.current).toBe(dialog);
  expect(ref.current?.style.maxWidth).toBe('520px');
  expect(ref.current?.style.width).toBe('400px');
  expect(dialog.className).toBe('sp-dialog custom');
  expect(title.current?.className).toBe('sp-dialog-title title');
  expect(description.current?.className).toBe(
    'sp-dialog-description description',
  );
  expect(header.current?.className).toBe('sp-dialog-header heading');
  expect(body.current?.className).toBe('sp-dialog-body body');
  expect(footer.current?.className).toBe('sp-dialog-footer footer');
  expect(screen.getByRole('button', { name: 'Tutup' })).not.toBeNull();
  rerender(
    <Dialog open>
      <DialogContent hideClose>
        <DialogTitle>Settings</DialogTitle>
        <DialogDescription>Preferences</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.queryByRole('button')).toBeNull();
});

it('allows a cancellable Escape event and custom overlay portal composition', async () => {
  const overlay = createRef<HTMLDivElement>();
  const escaped = mock((event: KeyboardEvent) => event.preventDefault());
  render(
    <Dialog defaultOpen>
      <DialogPortal>
        <DialogOverlay ref={overlay} className="custom-overlay" />
      </DialogPortal>
      <DialogContent onEscapeKeyDown={escaped}>
        <DialogTitle>Protected</DialogTitle>
        <DialogDescription>Details</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  expect(overlay.current?.className).toBe('sp-dialog-overlay custom-overlay');
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(escaped).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('dialog')).not.toBeNull();
});

for (const danger of [false, true]) {
  it(`confirms and cancels ${danger ? 'dangerous' : 'ordinary'} actions with child content and accessible description`, async () => {
    const confirm = mock(() => {});
    const cancel = mock(() => {});
    const change = mock((_open: boolean) => {});
    render(
      <ConfirmDialog
        open
        onOpenChange={change}
        title="Archive?"
        message="This can be restored."
        onConfirm={confirm}
        onCancel={cancel}
        isDanger={danger}
      >
        <span>Project details</span>
      </ConfirmDialog>,
    );
    const dialog = screen.getByRole('dialog', { name: 'Archive?' });
    expect(
      document.getElementById(dialog.getAttribute('aria-describedby') ?? '')
        ?.textContent,
    ).toBe('This can be restored.');
    expect(screen.getByText('Project details')).not.toBeNull();
    expect(
      screen.getByRole('button', { name: 'Confirm' }).dataset.variant,
    ).toBe(danger ? 'destructive' : 'primary');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledWith(false);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(2);
  });
}

it('allows cancelling without an optional callback', async () => {
  const change = mock((_open: boolean) => {});
  render(
    <ConfirmDialog
      open
      onOpenChange={change}
      title="Continue?"
      message="Confirm the action."
      onConfirm={() => {}}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(change).toHaveBeenCalledWith(false);
});

function ControlledHarness() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>Controlled trigger</DialogTrigger>
      <DialogContent>
        <DialogTitle>Controlled title</DialogTitle>
        <DialogDescription>Controlled description</DialogDescription>
      </DialogContent>
    </Dialog>
  );
}

it('lets application state control visibility through the public change callback', async () => {
  render(<ControlledHarness />);
  await userEvent.click(
    screen.getByRole('button', { name: 'Controlled trigger' }),
  );
  expect(screen.getByRole('dialog')).not.toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Close' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

function ConfirmationHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        External confirmation trigger
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm?"
        message="Please confirm."
        onConfirm={() => {}}
      />
    </>
  );
}

it('returns focus to an external confirmation trigger after dismissal', async () => {
  render(<ConfirmationHarness />);
  const trigger = screen.getByRole('button', {
    name: 'External confirmation trigger',
  });
  await userEvent.click(trigger);
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

const triggers = [
  'Open dialog',
  'Open controlled dialog',
  'Open without close icon',
  'Confirm archive',
  'Confirm deletion',
];
for (const [index, { name, render: Example }] of examples.entries()) {
  it(`opens and exercises the ${name} example`, async () => {
    const trigger = triggers[index];
    if (!trigger) throw new Error('Example trigger missing');
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: trigger }));
    expect(screen.getByRole('dialog')).not.toBeNull();
    if (name === 'controlled')
      await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    if (name === 'without-close')
      await userEvent.click(screen.getByRole('button', { name: 'Return' }));
    if (name === 'confirmation') {
      await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
      expect(screen.getByText('Archived')).not.toBeNull();
    }
    if (name === 'destructive') {
      await userEvent.click(
        screen.getByRole('button', { name: 'Keep project' }),
      );
      expect(screen.getByText('Kept')).not.toBeNull();
      await userEvent.click(screen.getByRole('button', { name: trigger }));
      await userEvent.click(
        screen.getByRole('button', { name: 'Delete project' }),
      );
      expect(screen.getByText('Deleted')).not.toBeNull();
    }
  });
}
