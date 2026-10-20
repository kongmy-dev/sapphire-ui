import { Kbd } from './kbd.js';

function KbdShortcut() {
  return (
    <p>
      Press <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd> to search.
    </p>
  );
}

function KbdSizes() {
  return (
    <div className="sp-cluster">
      <Kbd size="sm">Esc</Kbd>
      <Kbd>Enter</Kbd>
      <Kbd size="lg">Space</Kbd>
    </div>
  );
}

export const examples = [
  { name: 'shortcut', render: KbdShortcut },
  { name: 'sizes', render: KbdSizes },
] as const;
