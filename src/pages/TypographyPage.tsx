const typeScale = [
  { tag: 'h1', family: 'serif', size: 'clamp(2rem, 4vw, 3.5rem)', weight: 700, label: 'Heading 1', sample: 'The quick brown fox' },
  { tag: 'h2', family: 'serif', size: 'clamp(1.5rem, 3vw, 2.5rem)', weight: 700, label: 'Heading 2', sample: 'jumps over the lazy dog' },
  { tag: 'h3', family: 'serif', size: '1.5rem', weight: 600, label: 'Heading 3', sample: 'Efficient digital solutions' },
  { tag: 'h4', family: 'serif', size: '1.25rem', weight: 600, label: 'Heading 4', sample: 'Cloud infrastructure' },
  { tag: 'body', family: 'sans', size: '1rem', weight: 400, label: 'Body', sample: 'Helping businesses cut costs, automate operations, and build software that actually works.' },
  { tag: 'small', family: 'sans', size: '0.875rem', weight: 400, label: 'Small', sample: 'Updated 3 hours ago · 5 min read' },
  { tag: 'caption', family: 'sans', size: '0.75rem', weight: 600, label: 'Caption', sample: 'SECTION HEADER · UPPERCASE' },
  { tag: 'mono', family: 'mono', size: '0.875rem', weight: 400, label: 'Monospace', sample: 'const sapphire = "design-system"' },
];

const fonts = [
  { name: 'Newsreader', variable: '--font-serif', usage: 'Headings, editorial content, brand voice' },
  { name: 'Source Sans 3', variable: '--font-sans', usage: 'Body text, UI labels, navigation' },
  { name: 'JetBrains Mono', variable: '--font-mono', usage: 'Code, data values, technical labels' },
];

export default function TypographyPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Typography</h1>
        <p>Type scale and font family specimens. All sizes use fluid typography with clamp() for headings.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Font Families</h2>
        <div className="docs-stack">
          {fonts.map((f) => (
            <div key={f.name} className="docs-preview" style={{ padding: 24 }}>
              <div style={{ fontFamily: `var(${f.variable})`, fontSize: '1.5rem', color: 'var(--color-text-strong)', marginBottom: 4 }}>
                {f.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent-text)', marginBottom: 8 }}>
                {f.variable}
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--color-text-muted)' }}>
                {f.usage}
              </div>
              <div style={{ fontFamily: `var(${f.variable})`, fontSize: '1.1rem', color: 'var(--color-text-main)', marginTop: 12 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Type Scale</h2>
        <div className="docs-stack">
          {typeScale.map((t) => (
            <div key={t.tag} className="docs-preview" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-accent-text)', minWidth: 60 }}>
                  {t.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-text-subtle)' }}>
                  {t.size} · {t.weight}
                </span>
              </div>
              <div style={{
                fontFamily: `var(--font-${t.family})`,
                fontSize: t.size,
                fontWeight: t.weight,
                color: 'var(--color-text-strong)',
                lineHeight: 1.3,
                letterSpacing: t.tag === 'caption' ? '0.1em' : undefined,
                textTransform: t.tag === 'caption' ? 'uppercase' : undefined,
              }}>
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
