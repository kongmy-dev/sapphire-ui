import { useRef, useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Kbd } from '../components/ui/Kbd';
import { CodeBlock } from '../components/ui/CodeBlock';
import { useDebounce } from '../hooks/useDebounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useMediaQuery } from '../hooks/useMediaQuery';

/**
 * Docs page for Phase 4 React hooks + framework-agnostic CSS utilities.
 * Every hook gets a live, minimal example so consumers can see real
 * behaviour rather than reading a signature.
 */
export default function HooksPage() {
  // useDebounce
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const [searchCount, setSearchCount] = useState(0);
  useEffect(() => {
    if (debouncedQuery) setSearchCount((n) => n + 1);
  }, [debouncedQuery]);

  // useLocalStorage
  const [favColor, setFavColor] = useLocalStorage<string>('sapphire-fav-color', 'sapphire');

  // useCopyToClipboard
  const { copy, isCopied } = useCopyToClipboard({ resetMs: 1500 });

  // useOnClickOutside
  const popRef = useRef<HTMLDivElement>(null);
  const [popOpen, setPopOpen] = useState(false);
  useOnClickOutside(popRef, popOpen ? () => setPopOpen(false) : false);

  // useMediaQuery
  const isWide = useMediaQuery('(min-width: 1024px)');
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <div>
      <header className="docs-page-header">
        <h1>Hooks & Utilities</h1>
        <p>
          Six headless React hooks for everyday DX, plus a small set of
          framework-agnostic CSS utilities that ship in <code>style.css</code>.
        </p>
      </header>

      {/* ─── useDebounce ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useDebounce</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Returns the latest value only after a stable pause. Use for search
          inputs, autosave, and any handler that&apos;s expensive to run on every
          keystroke.
        </p>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <Label htmlFor="debounce-input">Search (400 ms debounce)</Label>
            <Input
              id="debounce-input"
              placeholder="Type quickly…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="cluster">
              <Badge variant="default">Live: {query || '—'}</Badge>
              <Badge variant="accent">Debounced: {debouncedQuery || '—'}</Badge>
              <Badge variant="success">Searches: {searchCount}</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* ─── useLocalStorage ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useLocalStorage</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          A drop-in for <code>useState</code> that persists across reloads and
          syncs across browser tabs via the <code>storage</code> event.
        </p>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 400 }}>
            <Label htmlFor="ls-input">Favourite colour (persists in localStorage)</Label>
            <Input
              id="ls-input"
              value={favColor}
              onChange={(e) => setFavColor(e.target.value)}
            />
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Reload the page or open another tab — the value stays in sync.
            </p>
            <Button variant="outline" size="sm" onClick={() => setFavColor('sapphire')}>
              Reset to &quot;sapphire&quot;
            </Button>
          </div>
        </div>
      </section>

      {/* ─── useCopyToClipboard ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useCopyToClipboard</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Wraps the Clipboard API and flips an <code>isCopied</code> flag for
          two seconds — perfect for &quot;Copy code&quot; or share buttons.
        </p>
        <div className="docs-preview">
          <div className="docs-stack" style={{ maxWidth: 480 }}>
            <CodeBlock language="bash" code="npm install @kongmy-dev/sapphire-ui" copyable variant="light" />
            <Button
              variant={isCopied ? 'accent' : 'outline'}
              onClick={() => copy('npm install @kongmy-dev/sapphire-ui')}
            >
              {isCopied ? 'Copied!' : 'Copy install command'}
            </Button>
          </div>
        </div>
      </section>

      {/* ─── useOnClickOutside ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useOnClickOutside</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Detects clicks, touches, and focus changes outside a referenced
          element. Use it to dismiss lightweight menus and popovers that aren&apos;t
          worth a full Radix primitive.
        </p>
        <div className="docs-preview">
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Button onClick={() => setPopOpen((o) => !o)}>
              {popOpen ? 'Close panel' : 'Open panel'}
            </Button>
            {popOpen && (
              <div
                ref={popRef}
                role="dialog"
                aria-label="Outside-click demo"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 10,
                  minWidth: 240,
                  padding: '12px 16px',
                  background: 'white',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md, 8px)',
                  boxShadow: '0 8px 32px rgba(10,25,47,0.14)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                }}
              >
                Click anywhere outside this panel to dismiss it.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── useMediaQuery ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useMediaQuery</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Subscribes to a CSS media query and re-renders when it flips. Useful
          for SSR-safe responsive logic and OS-level signals like
          <code> prefers-color-scheme</code>.
        </p>
        <div className="docs-preview">
          <div className="cluster">
            <Badge variant={isWide ? 'success' : 'default'}>
              ≥ 1024px: {isWide ? 'yes' : 'no'}
            </Badge>
            <Badge variant={prefersDark ? 'accent' : 'default'}>
              prefers-color-scheme: {prefersDark ? 'dark' : 'light'}
            </Badge>
          </div>
        </div>
      </section>

      {/* ─── useIsomorphicLayoutEffect ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">useIsomorphicLayoutEffect</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Aliases <code>useLayoutEffect</code> on the client and{' '}
          <code>useEffect</code> on the server so SSR frameworks (Next.js,
          Astro, Remix) don&apos;t spam warnings about mismatched effect timing.
          No demo — it&apos;s a one-line drop-in:
        </p>
        <CodeBlock
          language="tsx"
          copyable
          code={`import { useIsomorphicLayoutEffect } from '@kongmy-dev/sapphire-ui';

useIsomorphicLayoutEffect(() => {
  // Reads / writes to the DOM synchronously before paint.
}, [deps]);`}
        />
      </section>

      {/* ─── CSS utilities ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">CSS utilities</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          These class APIs ship in <code>style.css</code> and need no React
          import — usable from plain HTML, Astro, Vue, or any consumer that
          can include the stylesheet.
        </p>

        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>.stack — vertical rhythm</h3>
        <div className="docs-preview">
          <div className="stack" style={{ width: '100%', maxWidth: 360 }}>
            <Card>First item</Card>
            <Card>Second item</Card>
            <Card>Third item — each gap is `--stack-gap`</Card>
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>.cluster — wrapping horizontal group</h3>
        <div className="docs-preview">
          <div className="cluster">
            <Badge>React</Badge>
            <Badge variant="accent">Astro</Badge>
            <Badge variant="success">Vue</Badge>
            <Badge variant="warning">Svelte</Badge>
            <Badge variant="info">Solid</Badge>
            <Badge>Vanilla</Badge>
          </div>
        </div>

        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>.visually-hidden — accessible-only text</h3>
        <div className="docs-preview">
          <Button>
            <span aria-hidden="true">✕</span>
            <span className="visually-hidden">Close dialog</span>
          </Button>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            Screen readers announce &quot;Close dialog&quot;; sighted users see only the icon.
          </p>
        </div>

        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>.prose — long-form content</h3>
        <div className="docs-preview">
          <article className="prose">
            <h2>Editorial content</h2>
            <p>
              Drop <code>.prose</code> on a wrapper around CMS or markdown
              output and headings, paragraphs, lists, code, blockquotes, and
              links pick up Sapphire tokens automatically.
            </p>
            <blockquote>
              Typography should feel inevitable — never decorative.
            </blockquote>
            <ul>
              <li>Serif body, sans headings</li>
              <li>Accent-coloured links with offset underlines</li>
              <li>Token-driven, so dark mode flows through</li>
            </ul>
          </article>
        </div>

        <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>.cq — container queries</h3>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 0 1rem' }}>
          Add <code>.cq</code> on a parent, then use modifiers like
          <code> .cq-md:cols-3</code> on descendants. Resize the panel below
          to watch the grid reflow without touching the viewport width.
        </p>
        <div className="docs-preview">
          <div
            className="cq"
            style={{
              resize: 'horizontal',
              overflow: 'auto',
              padding: '1rem',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-md, 8px)',
              width: '100%',
              minWidth: 220,
              maxWidth: '100%',
            }}
          >
            <div className="cq-md:grid cq-md:cols-3 stack stack-sm" style={{ display: 'grid', gap: '0.75rem' }}>
              <Card>One</Card>
              <Card>Two</Card>
              <Card>Three</Card>
            </div>
            <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Drag the bottom-right corner. Cards switch to 3-up at ≥ 48rem container width.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Reference ─── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Reference</h2>
        <div className="docs-preview">
          <div className="cluster">
            <Kbd>useDebounce</Kbd>
            <Kbd>useLocalStorage</Kbd>
            <Kbd>useCopyToClipboard</Kbd>
            <Kbd>useOnClickOutside</Kbd>
            <Kbd>useMediaQuery</Kbd>
            <Kbd>useIsomorphicLayoutEffect</Kbd>
          </div>
        </div>
      </section>
    </div>
  );
}
