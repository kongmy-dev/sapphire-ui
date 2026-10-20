'use client';

import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Input } from '../input/input.js';
import { Kbd } from '../kbd/kbd.js';
import { Sheet, SheetContent, SheetTitle } from '../sheet/sheet.js';

export type CommandItem = {
  id: string;
  label: string;
  hint?: string | undefined;
  icon?: ReactElement | null | undefined;
  onSelect: (query: string) => void;
};

export type CommandPaletteProps = {
  items: CommandItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string | undefined;
};

type SearchProps = Pick<
  CommandPaletteProps,
  'items' | 'onOpenChange' | 'placeholder'
>;

function CommandOption({
  item,
  id,
  active,
  onActivate,
  onSelect,
}: {
  item: CommandItem;
  id: string;
  active: boolean;
  onActivate: () => void;
  onSelect: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      tabIndex={-1}
      className="sp-command-palette-item"
      onMouseEnter={onActivate}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      {item.icon && (
        <span className="sp-command-palette-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="sp-command-palette-label">{item.label}</span>
      {item.hint && (
        <span className="sp-command-palette-hint">{item.hint}</span>
      )}
    </li>
  );
}

function CommandSearch({
  items,
  onOpenChange,
  placeholder = 'Search…',
}: SearchProps) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const id = useId();
  const needle = query.trim().toLowerCase();
  const filtered = items.filter((item) =>
    `${item.label} ${item.hint ?? ''}`.toLowerCase().includes(needle),
  );
  const active = Math.max(0, Math.min(index, filtered.length - 1));
  const activeId = filtered[active] ? `${id}-option-${active}` : undefined;
  useEffect(() => {
    if (activeId)
      document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);
  function select(item: CommandItem) {
    item.onSelect(query);
    onOpenChange(false);
  }
  function key(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      const item = filtered[active];
      if (!item) return;
      event.preventDefault();
      select(item);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIndex(
        Math.max(
          0,
          Math.min(
            filtered.length - 1,
            active + (event.key === 'ArrowDown' ? 1 : -1),
          ),
        ),
      );
    }
  }
  return (
    <>
      <div className="sp-command-palette-header">
        <Input
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          aria-label="Search commands"
          aria-controls={`${id}-list`}
          aria-activedescendant={activeId}
          value={query}
          onKeyDown={key}
          onChange={(event) => {
            setQuery(event.target.value);
            setIndex(0);
          }}
          placeholder={placeholder}
        />
      </div>
      <div className="sp-command-palette-body">
        {filtered.length === 0 && (
          <p className="sp-command-palette-empty" role="status">
            No matches for &quot;{query}&quot;.
          </p>
        )}
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label="Command results"
          className="sp-command-palette-list"
        >
          {filtered.map((item, position) => (
            <CommandOption
              key={item.id}
              item={item}
              id={`${id}-option-${position}`}
              active={position === active}
              onActivate={() => setIndex(position)}
              onSelect={() => select(item)}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
  ...props
}: CommandPaletteProps) {
  const launcher = useRef<HTMLElement | null>(null);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="sp-command-palette"
        aria-describedby={undefined}
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          launcher.current = active instanceof HTMLElement ? active : null;
        }}
        onCloseAutoFocus={(event) => {
          if (launcher.current?.isConnected) {
            event.preventDefault();
            launcher.current.focus();
          }
        }}
      >
        <SheetTitle className="sp-command-palette-title">
          Command palette
        </SheetTitle>
        <CommandSearch {...props} onOpenChange={onOpenChange} />
        <footer className="sp-command-palette-footer">
          <span className="sp-command-palette-shortcut">
            <Kbd size="sm">↑</Kbd>
            <Kbd size="sm">↓</Kbd>navigate
          </span>
          <span className="sp-command-palette-shortcut">
            <Kbd size="sm">↵</Kbd>select
          </span>
          <span className="sp-command-palette-shortcut">
            <Kbd size="sm">Esc</Kbd>close
          </span>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
