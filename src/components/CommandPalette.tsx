import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/Sheet';
import { Input } from './ui/Input';
import { Kbd } from './ui/Kbd';

export interface CommandItem {
  /** Stable identifier; also used for keyboard match scoring. */
  id: string;
  /** Visible label. */
  label: string;
  /** Optional second line (route, section, etc.). */
  hint?: string;
  /** Optional Material Symbols icon name. */
  icon?: string;
  /** Invoked when the item is selected. Receives the matched query. */
  onSelect: (query: string) => void;
}

export interface CommandPaletteProps {
  /** Items to search through. */
  items: CommandItem[];
  /** Controlled open state. */
  open: boolean;
  /** Called whenever open state changes (Esc, backdrop, item select). */
  onOpenChange: (open: boolean) => void;
  /** Placeholder for the search input. */
  placeholder?: string;
}

/**
 * Lightweight Cmd+K command palette built from existing Sapphire primitives
 * (Sheet + Input + Kbd). Filters items by case-insensitive substring on
 * label and hint, and selects with Enter / arrow keys. Zero extra deps.
 */
export function CommandPalette({
  items,
  open,
  onOpenChange,
  placeholder = 'Search…',
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const haystack = `${item.label} ${item.hint ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
      return;
    }
    const handle = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(handle);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === 'Enter') {
      const target = filtered[activeIndex];
      if (target) {
        event.preventDefault();
        target.onSelect(query);
        onOpenChange(false);
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="max-h-[80vh] overflow-hidden p-0">
        <SheetHeader className="border-b border-border p-4 pb-2">
          <SheetTitle className="sr-only">Command palette</SheetTitle>
          <div onKeyDown={handleKey}>
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Search commands"
              aria-controls="command-palette-list"
              aria-activedescendant={
                filtered[activeIndex] ? `cmd-${filtered[activeIndex].id}` : undefined
              }
            />
          </div>
        </SheetHeader>
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 'calc(80vh - 80px)' }}
        >
          {filtered.length === 0 ? (
            <p className="m-0 px-4 py-8 text-center font-sans text-sm text-(--color-text-muted)">
              No matches for &quot;{query}&quot;.
            </p>
          ) : (
            <ul
              ref={listRef}
              id="command-palette-list"
              role="listbox"
              aria-label="Command results"
              className="m-0 list-none p-2"
            >
              {filtered.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={item.id}
                    id={`cmd-${item.id}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      item.onSelect(query);
                      onOpenChange(false);
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 font-sans text-sm"
                    style={{
                      background: isActive ? 'var(--color-surface)' : 'transparent',
                      color: 'var(--color-text-main)',
                    }}
                  >
                    {item.icon && (
                      <span
                        className="material-symbols-outlined shrink-0"
                        style={{ fontSize: 18, color: 'var(--color-text-muted)' }}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.hint && (
                      <span
                        className="font-mono text-xs"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {item.hint}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <footer
          className="flex items-center gap-3 border-t border-border px-4 py-2 font-sans text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1">
            <Kbd size="sm">↑</Kbd>
            <Kbd size="sm">↓</Kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd size="sm">↵</Kbd> select
          </span>
          <span className="flex items-center gap-1">
            <Kbd size="sm">Esc</Kbd> close
          </span>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
