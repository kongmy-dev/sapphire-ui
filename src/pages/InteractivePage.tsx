import { useState, useRef } from 'react';
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogBody, DialogFooter, DialogClose, ConfirmDialog,
} from '../components/ui/Dialog';
import { Button } from '../components/ui/Button';
import { Toast, type ToastRef } from '../components/Toast';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '../components/ui/Sheet';
import { Popover, PopoverTrigger, PopoverContent } from '../components/ui/Popover';
import { Tooltip, TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent } from '../components/ui/Tooltip';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/HoverCard';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuShortcut } from '../components/ui/DropdownMenu';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

export default function InteractivePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);
  const toastRef = useRef<ToastRef>(null);
  
  const [showCompleted, setShowCompleted] = useState(true);
  const [showDrafts, setShowDrafts] = useState(false);

  return (
    <div>
      <header className="docs-page-header">
        <h1>Interactive Overlays</h1>
        <p>
          Modal dialogs, toast notifications, sheets, tooltips, and popovers.
        </p>
      </header>

      {/* ─── Dialog ─────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Dialog</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Accessible modal built on Radix Dialog. Includes focus trap, Escape close, and overlay click dismiss.
          Use the compound sub-components for custom layouts, or <code className="docs-props-table code">ConfirmDialog</code> for quick confirmations.
        </p>
        <div className="docs-preview">
          <div className="docs-flex">
            {/* Custom Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="primary">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent maxWidth="500px">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <DialogDescription>Update your display name and email address.</DialogDescription>
                  <div className="mt-4 flex flex-col gap-4">
                    <div>
                      <Label htmlFor="dialog-name">Name</Label>
                      <Input id="dialog-name" placeholder="Jane Doe" />
                    </div>
                    <div>
                      <Label htmlFor="dialog-email">Email</Label>
                      <Input id="dialog-email" placeholder="jane@example.com" />
                    </div>
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={() => setDialogOpen(false)}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ConfirmDialog */}
            <Button variant="outline" onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title="Confirm Action"
              message="Are you sure you want to sync all cloud accounts? This may take a few minutes."
              confirmLabel="Sync Now"
              onConfirm={() => toastRef.current?.show('Sync started!', 'success')}
            />

            {/* Danger Dialog */}
            <Button variant="outline" onClick={() => setDangerOpen(true)} style={{ color: 'var(--color-error)' }}>
              Danger Dialog
            </Button>
            <ConfirmDialog
              open={dangerOpen}
              onOpenChange={setDangerOpen}
              title="Delete Account"
              message="This action is permanent and cannot be undone. All data will be lost."
              confirmLabel="Delete"
              isDanger
              onConfirm={() => toastRef.current?.show('Account deleted.', 'error')}
            />
          </div>
        </div>
      </section>

      {/* ─── Toast ──────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Toast</h2>
        <p className="mb-4 font-sans text-sm/relaxed text-(--color-text-muted)">
          Framework-agnostic toast notifications via Web Component. React wrapper exposes <code className="docs-props-table code">show()</code> via ref.
          Also available in vanilla JS via <code className="docs-props-table code">window.__sapphireToast()</code>.
        </p>
        <div className="docs-preview">
          <div className="docs-flex">
            <Button variant="primary" onClick={() => toastRef.current?.show('Changes saved successfully!', 'success')}>
              Success Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('New version available.', 'info')}>
              Info Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('API rate limit approaching.', 'warning')}>
              Warning Toast
            </Button>
            <Button variant="outline" onClick={() => toastRef.current?.show('Connection failed.', 'error')}>
              Error Toast
            </Button>
          </div>
        </div>
        <Toast ref={toastRef} />
      </section>

      {/* ─── Sheet (Side Drawer) ────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Sheet (Side Drawer)</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
              <Sheet key={side}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">{side}</Button>
                </SheetTrigger>
                <SheetContent side={side}>
                  <SheetHeader>
                    <SheetTitle style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 600, margin: 0 }}>
                      Sheet from {side}
                    </SheetTitle>
                    <SheetDescription style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>
                      Anything can go inside a Sheet — forms, content, configuration panels.
                    </SheetDescription>
                  </SheetHeader>
                  <div style={{ marginTop: 16, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
                    Slot content here.
                  </div>
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline" size="sm">Cancel</Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button size="sm">Save</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Popover ────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Popover</h2>
        <div className="docs-preview">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Edit profile</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="docs-stack" style={{ gap: 12 }}>
                <div style={{ fontWeight: 600 }}>Profile</div>
                <div className="docs-stack" style={{ gap: 6 }}>
                  <Label htmlFor="popover-name">Name</Label>
                  <Input id="popover-name" defaultValue="Kong My" />
                </div>
                <div className="docs-stack" style={{ gap: 6 }}>
                  <Label htmlFor="popover-handle">Handle</Label>
                  <Input id="popover-handle" defaultValue="@kongmy" />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* ─── Tooltip ────────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Tooltip</h2>
        <div className="docs-preview">
          <TooltipProvider delayDuration={200}>
            <div className="docs-flex" style={{ gap: 12, alignItems: 'center' }}>
              <Tooltip content="Quick info shown on hover" noProvider>
                <Button variant="outline" size="sm">Hover me</Button>
              </Tooltip>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Settings">⚙</Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Settings</TooltipContent>
              </TooltipRoot>
              <TooltipRoot>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Help">?</Button>
                </TooltipTrigger>
                <TooltipContent side="right">Documentation</TooltipContent>
              </TooltipRoot>
            </div>
          </TooltipProvider>
        </div>
      </section>

      {/* ─── Hover Card ─────────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Hover Card</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Hover over:</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-accent-text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  @kongmy
                </a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar fallback="KM" size="md" />
                  <div>
                    <div style={{ fontWeight: 600 }}>KONGMY Digital</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>
                      Editorial-grade design system for IT consultancies.
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* ─── Dropdown Menu ──────────────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Dropdown Menu</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ gap: 12 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Item</DropdownMenuLabel>
                 <DropdownMenuItem onSelect={() => toastRef.current?.show('Edit action triggered', 'info')}>
                  Edit
                  <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toastRef.current?.show('Duplicate action triggered', 'info')}>
                  Duplicate
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => toastRef.current?.show('Delete action triggered', 'warning')} style={{ color: '#b91c1c' }}>
                  Delete
                  <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">View options</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Filters</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={showCompleted} onCheckedChange={setShowCompleted}>
                  Show completed
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={showDrafts} onCheckedChange={setShowDrafts}>
                  Show drafts
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

    </div>
  );
}
