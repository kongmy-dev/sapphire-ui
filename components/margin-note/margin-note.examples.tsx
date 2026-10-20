import { MarginNote } from './margin-note.js';

function MarginNoteReferences() {
  return (
    <div className="sp-prose">
      <p>
        The service offers{' '}
        <MarginNote
          id="availability-note"
          note="Measured over a calendar month, excluding scheduled maintenance."
        >
          99.9% availability
        </MarginNote>
        . The agreement also includes{' '}
        <MarginNote
          id="support-note"
          note="Support responds within one business day."
        >
          business support
        </MarginNote>
        . Both commitments apply throughout the engagement.
      </p>
      <p>Contact the team to discuss additional coverage.</p>
    </div>
  );
}

export const examples = [
  { name: 'references', render: MarginNoteReferences },
] as const;
