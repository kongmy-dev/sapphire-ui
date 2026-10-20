import { ScrollArea, ScrollBar } from './scroll-area.js';

function ScrollAreaVertical() {
  return (
    <ScrollArea className="docs-scroll-area" aria-label="Activity history">
      <div className="docs-scroll-list">
        {Array.from({ length: 20 }, (_, index) => (
          <p key={index}>Activity entry {index + 1}</p>
        ))}
      </div>
    </ScrollArea>
  );
}

function ScrollAreaHorizontal() {
  return (
    <ScrollArea className="docs-scroll-area" aria-label="Release timeline">
      <div className="docs-scroll-wide">
        January · February · March · April · May · June · July · August ·
        September · October · November · December
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

export const examples = [
  { name: 'vertical', render: ScrollAreaVertical },
  { name: 'horizontal', render: ScrollAreaHorizontal },
] as const;
