'use client';

import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card.js';

function HoverCardProfile() {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <a href="#alex">Alex Morgan</a>
      </HoverCardTrigger>
      <HoverCardContent>
        <h3>Alex Morgan</h3>
        <p>Product designer building accessible interfaces.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

function HoverCardPreview() {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <a href="#design-guide">Design guide</a>
      </HoverCardTrigger>
      <HoverCardContent side="right" align="start">
        <h3>Design guide preview</h3>
        <p>Tokens, layout and component usage.</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export const examples = [
  { name: 'profile', render: HoverCardProfile },
  { name: 'preview', render: HoverCardPreview },
] as const;
