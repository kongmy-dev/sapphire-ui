'use client';

import { useState } from 'react';
import { Toggle, ToggleGroup, ToggleGroupItem } from './toggle.js';

function ToggleFormatting() {
  return (
    <div className="sp-cluster">
      <Toggle aria-label="Bold">B</Toggle>
      <Toggle variant="outline" size="sm" aria-label="Italic">
        I
      </Toggle>
      <Toggle variant="ghost" size="lg" disabled aria-label="Underline">
        U
      </Toggle>
    </div>
  );
}

function ToggleAlignment() {
  const [value, setValue] = useState('left');
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={setValue}
      aria-label="Text alignment"
      variant="outline"
    >
      <ToggleGroupItem value="left" aria-label="Align left">
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center" aria-label="Align center">
        Center
      </ToggleGroupItem>
      <ToggleGroupItem
        value="right"
        aria-label="Align right"
        variant="ghost"
        size="sm"
      >
        Right
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

function ToggleMultiple() {
  return (
    <ToggleGroup
      type="multiple"
      defaultValue={['bold']}
      aria-label="Text styles"
      size="lg"
    >
      <ToggleGroupItem value="bold" aria-label="Bold text">
        Bold
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic text">
        Italic
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export const examples = [
  { name: 'formatting', render: ToggleFormatting },
  { name: 'alignment', render: ToggleAlignment },
  { name: 'multiple', render: ToggleMultiple },
] as const;
