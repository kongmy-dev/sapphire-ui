import { useState, useRef } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Kbd } from '../components/ui/Kbd';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Toggle, ToggleGroup, ToggleGroupItem } from '../components/ui/Toggle';
import { ScrollArea } from '../components/ui/ScrollArea';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../components/ui/HoverCard';
import { Banner, type BannerRef } from '../components/Banner';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';

const sampleCode = `import { Button, Card } from '@kongmy-dev/sapphire-ui';
import '@kongmy-dev/sapphire-ui/style.css';

export function Hero() {
  return (
    <Card variant="feature" hoverable>
      <h1>Welcome to Sapphire UI</h1>
      <Button variant="accent">Get started</Button>
    </Card>
  );
}`;

export default function ExtendedPage() {
  const [pressed, setPressed] = useState(false);
  const [align, setAlign] = useState('left');
  const [formatting, setFormatting] = useState<string[]>(['bold']);
  const bannerRef = useRef<BannerRef>(null);

  return (
    <div>
      <header className="docs-page-header">
        <h1>Extended</h1>
        <p>Phase 3 primitives — breadcrumb trails, keyboard hints, code blocks, toggles, scroll areas, hover previews, and dismissible banners.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Breadcrumb</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Data Display', href: '/data' },
                { label: 'Tables' },
              ]}
            />
            <Breadcrumb
              separator="›"
              items={[
                { label: 'Sapphire', href: '/' },
                { label: 'Components', href: '/components' },
                { label: 'Breadcrumb' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Kbd</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 12 }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              Open the command palette with <Kbd>⌘</Kbd> <Kbd>K</Kbd> (Mac) or{' '}
              <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> (Windows / Linux).
            </p>
            <div className="docs-flex" style={{ gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13 }}>Sizes:</span>
              <Kbd size="sm">Esc</Kbd>
              <Kbd>Enter</Kbd>
              <Kbd size="lg">Shift</Kbd>
            </div>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Code Block</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <CodeBlock code={sampleCode} language="tsx" copyable />
            <CodeBlock code="$ bun add @kongmy-dev/sapphire-ui" language="shell" variant="light" copyable />
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Toggle</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 16 }}>
            <div className="docs-flex" style={{ gap: 8, alignItems: 'center' }}>
              <Toggle pressed={pressed} onPressedChange={setPressed}>
                {pressed ? 'On' : 'Off'}
              </Toggle>
              <Toggle variant="outline" defaultPressed>Outline</Toggle>
              <Toggle variant="ghost">Ghost</Toggle>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Single-select (text alignment)
              </div>
              <ToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)} variant="outline">
                <ToggleGroupItem value="left">Left</ToggleGroupItem>
                <ToggleGroupItem value="center">Center</ToggleGroupItem>
                <ToggleGroupItem value="right">Right</ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Multi-select (text formatting)
              </div>
              <ToggleGroup type="multiple" value={formatting} onValueChange={setFormatting}>
                <ToggleGroupItem value="bold"><strong>B</strong></ToggleGroupItem>
                <ToggleGroupItem value="italic"><em>I</em></ToggleGroupItem>
                <ToggleGroupItem value="underline"><u>U</u></ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Scroll Area</h2>
        <div className="docs-preview">
          <ScrollArea style={{ height: 180, width: '100%', maxWidth: 320, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ padding: 16, fontFamily: 'var(--font-sans)', fontSize: 14 }}>
              {Array.from({ length: 25 }, (_, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--color-border)' }}>
                  Item {i + 1} — scroll to see more
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Hover Card</h2>
        <div className="docs-preview">
          <div className="docs-flex" style={{ gap: 16, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14 }}>Hover over:</span>
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--color-accent-text)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                  @kongmy
                </a>
              </HoverCardTrigger>
              <HoverCardContent>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar fallback="KM" size="md" />
                  <div>
                    <div style={{ fontWeight: 600 }}>KONGMY Digital</div>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 2 }}>
                      Editorial-grade design system for IT consultancies.
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Banner</h2>
        <div className="docs-preview">
          <div className="docs-stack" style={{ gap: 12 }}>
            <Banner variant="info">
              Heads up — this is an informational banner.
            </Banner>
            <Banner variant="success">
              Your changes were saved successfully.
            </Banner>
            <Banner variant="warning">
              You're approaching your API quota for this month.
            </Banner>
            <Banner variant="error">
              Something went wrong — please retry.
            </Banner>
            <Banner variant="accent" ref={bannerRef}>
              Dismissible banner — click × to close. <Button size="sm" variant="link" onClick={() => bannerRef.current?.show()}>Restore</Button>
            </Banner>
          </div>
        </div>
      </section>
    </div>
  );
}
