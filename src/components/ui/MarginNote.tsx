import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface MarginNoteProps extends HTMLAttributes<HTMLSpanElement> {
  id: string;
  note: ReactNode;
  children: ReactNode; // Inline reference text
}

const MarginNote = forwardRef<HTMLSpanElement, MarginNoteProps>(
  ({ className, id, note, children, ...props }, ref) => {
    return (
      <span ref={ref} className={cn('group/note relative inline', className)} {...props}>
        {/* The inline text that triggers the note */}
        <span
          className="cursor-help border-b border-dashed border-accent/50 transition-colors hover:border-accent hover:bg-accent/10"
          aria-describedby={id}
        >
          {children}
        </span>
        
        {/* Mobile: reflows inline as a block after the text */}
        <span
          id={id}
          className="mt-2 block rounded-sm bg-surface p-3 text-sm text-(--color-text-muted) lg:hidden"
        >
          {note}
        </span>
        
        {/* Desktop: absolute positioned in right margin gutter */}
        <span
          className="absolute top-0 left-[calc(100%+2rem)] hidden w-[240px] text-sm text-(--color-text-muted) transition-colors group-hover/note:text-(--color-text-main) lg:block"
          aria-hidden="true"
        >
          {note}
        </span>
      </span>
    );
  }
);
MarginNote.displayName = 'MarginNote';

export { MarginNote };
