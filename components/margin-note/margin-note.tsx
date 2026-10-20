import type { ComponentProps, ReactNode } from 'react';

export type MarginNoteProps = ComponentProps<'span'> & {
  id: string;
  note: ReactNode;
  children: ReactNode;
};

export function MarginNote({
  className,
  id,
  note,
  children,
  ...props
}: MarginNoteProps) {
  return (
    <span
      {...props}
      className={['sp-margin-note', className].filter(Boolean).join(' ')}
      data-slot="margin-note"
    >
      <a
        className="sp-margin-note-anchor"
        href={`#${id}`}
        aria-describedby={id}
      >
        {children}
      </a>
      <span id={id} className="sp-margin-note-inline" tabIndex={-1}>
        {note}
      </span>
    </span>
  );
}
