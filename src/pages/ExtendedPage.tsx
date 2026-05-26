import { useState, useRef } from 'react';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Kbd } from '../components/ui/Kbd';
import { CodeBlock } from '../components/ui/CodeBlock';
import { Toggle, ToggleGroup, ToggleGroupItem } from '../components/ui/Toggle';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Banner, type BannerRef } from '../components/Banner';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/Accordion';
import { Callout } from '../components/ui/Callout';
import { MarginNote } from '../components/ui/MarginNote';
import { Timeline, TimelineItem, TimelineIndicator, TimelineContent } from '../components/ui/Timeline';

import { TableOfContents } from '../components/ui/TableOfContents';
import { Card } from '../components/ui/Card';

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
        <p>Phase 3 primitives — breadcrumb trails, keyboard hints, code blocks, toggles, scroll areas, and complex editorial layouts.</p>
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
            <CodeBlock variant="light" code={sampleCode} language="tsx" copyable />
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
              You&apos;re approaching your API quota for this month.
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

      <section className="docs-section">
        <h2 className="docs-section-title">Accordion</h2>
        <div className="docs-preview">
          <Accordion type="single" collapsible style={{ maxWidth: 600 }}>
            <AccordionItem value="q1">
              <AccordionTrigger>What is Sapphire UI?</AccordionTrigger>
              <AccordionContent>
                An editorial-focused design system for KONGMY Digital Solutions. Built on
                Radix UI primitives with Web Component escape hatches for framework-agnostic
                usage in Astro, vanilla HTML, and other non-React contexts.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Does it work outside React?</AccordionTrigger>
              <AccordionContent>
                Yes — the dual-export architecture ships a vanilla <code>./elements</code>
                entry that registers the custom elements (Toast, CookieBanner, Banner,
                Analytics, SiteHeader, SiteFooter) without pulling React. Astro-static
                consumers can drop them in via plain HTML — see the Interactive page for
                usage.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>What&apos;s the bundle size?</AccordionTrigger>
              <AccordionContent>
                ~20 KB gzip for the full React bundle, with peer-dep externalization so
                consumers only pay for what they import. The vanilla entry is ~4 KB gzip.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── Editorial Primitives ─────────────────────────────────── */}
      <section className="docs-section">
        <h2 className="docs-section-title">Editorial & Complex Primitives</h2>
        <div className="flex flex-col gap-8">
          
          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Editorial Callout</h3>
            <Callout title="Key Takeaway" icon="bolt" variant="subtle">
              <ul>
                <li>UI primitives should be highly cohesive and loosely coupled.</li>
                <li>Design systems enforce consistency across micro-frontends.</li>
              </ul>
            </Callout>
          </Card>

          <Card style={{ padding: 24 }}>
            <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Margin Note (Sidenote)</h3>
            <p className="text-sm/relaxed text-(--color-text-main)" style={{ maxWidth: 600 }}>
              When writing highly technical blog posts, we often need to reference external sources or explain a tangential concept without interrupting the main prose. Here is an example of a <MarginNote id="mn-1" note="This note appears in the margin on desktop and reflows inline on mobile devices.">Tufte-style margin note</MarginNote> in action.
            </p>
          </Card>



          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card style={{ padding: 24 }}>
              <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Revision Timeline</h3>
              <Timeline orientation="vertical">
                <TimelineItem>
                  <TimelineIndicator>
                    <Avatar size="xs" fallback="KM" />
                  </TimelineIndicator>
                  <TimelineContent>
                    <div className="text-sm font-semibold">v1.2.0 - Core Update</div>
                    <div className="text-xs text-(--color-text-muted)">Added timeline primitive.</div>
                  </TimelineContent>
                </TimelineItem>
                <TimelineItem>
                  <TimelineIndicator isLast>
                    <Avatar size="xs" fallback="KM" />
                  </TimelineIndicator>
                  <TimelineContent>
                    <div className="text-sm font-semibold">v1.1.0 - Layouts</div>
                    <div className="text-xs text-(--color-text-muted)">Added admin sidebar layout.</div>
                  </TimelineContent>
                </TimelineItem>
              </Timeline>
            </Card>

            <Card style={{ padding: 24 }}>
              <h3 className="mb-4 font-serif text-lg font-semibold text-(--color-text-strong)">Table of Contents</h3>
              <TableOfContents
                activeId="sec2"
                items={[
                  { id: 'sec1', level: 2, title: 'Introduction to Web Architecture' },
                  { id: 'sec2', level: 2, title: 'Component Reusability' },
                  { id: 'sec2-1', level: 3, title: 'Extracting Primitives' },
                  { id: 'sec2-2', level: 3, title: 'Styling with CSS Variables' },
                  { id: 'sec3', level: 2, title: 'Conclusion' }
                ]}
              />
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
