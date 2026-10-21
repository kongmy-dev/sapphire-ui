import { useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '../components/button/button.js';
import { Input } from '../components/input/input.js';
import { useCopyToClipboard } from '../hooks/use-copy-to-clipboard.js';
import { useDebounce } from '../hooks/use-debounce.js';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect.js';
import { useLocalStorage } from '../hooks/use-local-storage.js';
import { useMediaQuery } from '../hooks/use-media-query.js';
import { useOnClickOutside } from '../hooks/use-on-click-outside.js';

function DebounceDemo() {
  const [query, setQuery] = useState('Sapphire');
  const value = useDebounce(query, 300);
  const id = useId();
  return (
    <div className="sp-stack">
      <label htmlFor={id}>Search query</label>
      <Input
        id={id}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p>
        Settled query: <output aria-live="polite">{value}</output>
      </p>
    </div>
  );
}

function MediaDemo() {
  const wide = useMediaQuery('(min-width: 48rem)');
  return (
    <div className="sp-stack">
      <p>Resize the window across 48rem to update the match.</p>
      <output aria-live="polite">
        {wide ? 'Wide viewport' : 'Narrow viewport'}
      </output>
    </div>
  );
}

function StorageDemo() {
  const [compact, setCompact] = useLocalStorage(
    'sapphire-docs-hook-compact',
    false,
    (value) => value === true,
  );
  return (
    <div className="sp-stack">
      <Button
        aria-pressed={compact}
        onClick={() => setCompact((value) => !value)}
      >
        Compact preference
      </Button>
      <output aria-live="polite">{compact ? 'Compact' : 'Comfortable'}</output>
      <p>
        Reload this page or open it in another tab to read the saved preference.
        This demo uses only its own storage key.
      </p>
    </div>
  );
}

function OutsideDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, open ? () => setOpen(false) : false);
  return (
    <div className="sp-stack">
      <div ref={ref} className="sp-card sp-stack">
        <Button aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Toggle sample panel
        </Button>
        {open && (
          <p>Click or move keyboard focus outside this card to dismiss.</p>
        )}
      </div>
      <label>
        Outside focus target
        <Input placeholder="Move focus here" />
      </label>
      <output aria-live="polite">{open ? 'Panel open' : 'Panel closed'}</output>
    </div>
  );
}

function CopyDemo() {
  const { copy, isCopied } = useCopyToClipboard();
  const [failed, setFailed] = useState(false);
  const [text, setText] = useState('Hello from Sapphire');
  const id = useId();
  const feedback = isCopied ? 'Copied sample text' : 'Ready to copy';
  return (
    <div className="sp-stack">
      <label htmlFor={id}>Text to copy</label>
      <Input
        id={id}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button onClick={async () => setFailed(!(await copy(text)))}>
        Copy sample text
      </Button>
      <output aria-live="polite">
        {failed ? 'Copy failed. Select the text and copy manually.' : feedback}
      </output>
    </div>
  );
}

function LayoutDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [version, setVersion] = useState(0);
  useIsomorphicLayoutEffect(() => {
    setWidth(ref.current?.getBoundingClientRect().width ?? 0);
  }, [version]);
  return (
    <div className="sp-stack">
      <div ref={ref} className="sp-card">
        Measured card
      </div>
      <Button onClick={() => setVersion((value) => value + 1)}>
        Measure card
      </Button>
      <output aria-live="polite">Card width: {Math.round(width)} px</output>
      <p>
        Resize the viewport, then measure again. The layout effect reads the
        card before the update paints.
      </p>
    </div>
  );
}

const demos = {
  'use-debounce': DebounceDemo,
  'use-media-query': MediaDemo,
  'use-local-storage': StorageDemo,
  'use-on-click-outside': OutsideDemo,
  'use-copy-to-clipboard': CopyDemo,
  'use-isomorphic-layout-effect': LayoutDemo,
};

export function mountHooks() {
  for (const [name, Demo] of Object.entries(demos)) {
    const target = document.querySelector(`[data-hook-demo="${name}"]`);
    if (target) createRoot(target, { identifierPrefix: name }).render(<Demo />);
  }
}
