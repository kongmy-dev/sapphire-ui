import { useState } from 'react'
import './App.css'

interface Toast {
  id: number
  message: string
}

function App() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [playgroundText, setPlaygroundText] = useState('I build the missing piece.')

  // Helper to spawn elegant toast alerts
  const showToast = (message: string) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 2500)
  }

  // Copy-to-clipboard handler
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast(`Copied ${label} (${text}) to clipboard!`)
      })
      .catch(() => {
        showToast(`Failed to copy ${text}`)
      })
  }

  return (
    <div className="page-container">
      {/* Toast Notification Mount */}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <span className="material-symbols-outlined icon">check_circle</span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Masthead Header */}
      <header className="masthead">
        <div>
          <div className="eyebrow">Design System · Visual Catalog</div>
          <h1 className="brand-title">
            Sapphire UI<span className="dot">.</span>
          </h1>
        </div>
        <div className="meta">
          <div><strong>Edition</strong> Beta</div>
          <div><strong>Updated</strong> 18 · V · 2026</div>
          <div><strong>Source</strong> sapphire-ui.css</div>
        </div>
      </header>

      {/* Lede intro paragraph */}
      <p className="lede">
        The official visual specification and component catalog for <strong>Sapphire UI</strong> — a custom design system tailored for KONGMY Digital Solutions. Restrained, highly editorial, structured around deep navy authority and crisp gold accents. Designed to present technical solutions with clarity and precision.
      </p>

      {/* ============ § 01: COLORS ============ */}
      <section className="spec-section">
        <div className="section-head">
          <div className="num">§ 01</div>
          <h2>Colors</h2>
          <div className="label">Brand · 4 + Text scale · 4</div>
        </div>

        <div className="palette-grid">
          {/* Swatch 1: Dark Navy */}
          <div 
            className="swatch-card" 
            onClick={() => copyToClipboard('#0a192f', 'Dark Navy')}
            title="Click to copy Hex code"
          >
            <div className="chip" style={{ background: 'var(--color-primary)' }}></div>
            <div className="meta">
              <h3 className="name">Dark Navy</h3>
              <div className="token">--color-primary</div>
              <div className="hex">
                <span>#0a192f</span>
                <small>brand · primary</small>
              </div>
            </div>
          </div>

          {/* Swatch 2: Gold */}
          <div 
            className="swatch-card" 
            onClick={() => copyToClipboard('#c5a065', 'Gold')}
            title="Click to copy Hex code"
          >
            <div className="chip" style={{ background: 'var(--color-accent)' }}></div>
            <div className="meta">
              <h3 className="name">Gold</h3>
              <div className="token">--color-accent</div>
              <div className="hex">
                <span>#c5a065</span>
                <small>brand · accent</small>
              </div>
            </div>
          </div>

          {/* Swatch 3: Off-white */}
          <div 
            className="swatch-card" 
            onClick={() => copyToClipboard('#f4f6f8', 'Off-white')}
            title="Click to copy Hex code"
          >
            <div className="chip" style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}></div>
            <div className="meta">
              <h3 className="name">Off-white</h3>
              <div className="token">--color-surface</div>
              <div className="hex">
                <span>#f4f6f8</span>
                <small>page · background</small>
              </div>
            </div>
          </div>

          {/* Swatch 4: White */}
          <div 
            className="swatch-card" 
            onClick={() => copyToClipboard('#ffffff', 'White')}
            title="Click to copy Hex code"
          >
            <div className="chip" style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-border)' }}></div>
            <div className="meta">
              <h3 className="name">White</h3>
              <div className="token">--color-white</div>
              <div className="hex">
                <span>#ffffff</span>
                <small>card · fill</small>
              </div>
            </div>
          </div>

          {/* Color Details & Utility row */}
          <div className="text-row">
            <div className="cell" onClick={() => copyToClipboard('#1e293b', '--color-text-main')} style={{ cursor: 'pointer' }}>
              <div className="lvl">--color-text-main</div>
              <div className="demo-text" style={{ color: 'var(--color-text-main)' }}>Primary body text</div>
              <div className="hx">#1e293b</div>
            </div>
            
            <div className="cell" onClick={() => copyToClipboard('#64748b', '--color-text-muted')} style={{ cursor: 'pointer' }}>
              <div className="lvl">--color-text-muted</div>
              <div className="demo-text" style={{ color: 'var(--color-text-muted)' }}>Captions & metadata</div>
              <div className="hx">#64748b</div>
            </div>

            <div className="cell" onClick={() => copyToClipboard('#f1f5f9', '--color-text-on-dark')} style={{ background: 'var(--color-primary)', cursor: 'pointer' }}>
              <div className="lvl" style={{ color: 'var(--color-text-on-dark-muted)' }}>--color-text-on-dark</div>
              <div className="demo-text" style={{ color: 'var(--color-text-on-dark)' }}>Body on navy</div>
              <div className="hx" style={{ color: 'var(--color-text-on-dark)' }}>#f1f5f9</div>
            </div>

            <div className="cell" onClick={() => copyToClipboard('#e2e8f0', '--color-border')} style={{ cursor: 'pointer' }}>
              <div className="lvl">--color-border</div>
              <div className="demo-text">
                <span style={{
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-block',
                  fontSize: '0.875rem'
                }}>
                  1px hairline
                </span>
              </div>
              <div className="hx" style={{ marginTop: 'var(--space-2)' }}>#e2e8f0</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ § 02: TYPOGRAPHY ============ */}
      <section className="spec-section">
        <div className="section-head">
          <div className="num">§ 02</div>
          <h2>Typography</h2>
          <div className="label">Newsreader · Source Sans 3 · JetBrains Mono</div>
        </div>

        {/* Live Typography Playground */}
        <div className="type-playground">
          <label htmlFor="playground-input">Specimen Playground</label>
          <input
            id="playground-input"
            type="text"
            value={playgroundText}
            onChange={(e) => setPlaygroundText(e.target.value)}
            placeholder="Type custom text to preview typography scales..."
          />
        </div>

        {/* Font specifications scale */}
        <div className="type-grid">
          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-display-xl</span>
              <span className="props">Newsreader<br/>clamp(2.5rem · 6vw · 4.5rem)<br/>weight 600 · -0.01em</span>
            </div>
            <div className="sample">
              <span className="t-display-xl">{playgroundText || 'I build the missing piece.'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-display</span>
              <span className="props">Newsreader<br/>clamp(2rem · 4vw · 3.25rem)<br/>weight 600</span>
            </div>
            <div className="sample">
              <span className="t-display">{playgroundText || 'Section heading, h2 register.'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-heading</span>
              <span className="props">Newsreader<br/>clamp(1.5rem · 3vw · 2rem)<br/>weight 500</span>
            </div>
            <div className="sample">
              <span className="t-heading">{playgroundText || 'Card and feature titles'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-subheading</span>
              <span className="props">Newsreader<br/>1.25rem · weight 500</span>
            </div>
            <div className="sample">
              <span className="t-subheading">{playgroundText || 'Inline subhead, h4'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-lg</span>
              <span className="props">Source Sans 3<br/>1.125rem · weight 400</span>
            </div>
            <div className="sample">
              <span className="t-body-lg">{playgroundText || 'Lede copy and emphasized intros — set on light surfaces, never mid-paragraph.'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-base</span>
              <span className="props">Source Sans 3<br/>1rem · weight 400 · 1.6</span>
            </div>
            <div className="sample">
              <span className="t-body">{playgroundText || 'A professionally hosted website should be fast, always-on, and not require a dedicated IT person to keep it running. Reading width capped near 65 characters.'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-sm</span>
              <span className="props">Source Sans 3<br/>0.875rem · weight 400</span>
            </div>
            <div className="sample">
              <span className="t-body-sm">{playgroundText || 'Smaller copy carries footnotes, captions, and supporting metadata.'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--text-xs · uppercase</span>
              <span className="props">Source Sans 3<br/>0.75rem · weight 600 · 0.04em</span>
            </div>
            <div className="sample">
              <span className="t-eyebrow" style={{ color: 'var(--color-text-muted)' }}>
                {playgroundText || 'Product Owner · MBA · Full Stack Engineer'}
              </span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">--font-mono</span>
              <span className="props">JetBrains Mono<br/>0.875rem · weight 400</span>
            </div>
            <div className="sample">
              <span className="t-mono">{playgroundText ? `// ${playgroundText}` : '--color-accent: #c5a065;'}</span>
            </div>
          </div>

          <div className="type-row">
            <div className="meta">
              <span className="tok">Material Symbols</span>
              <span className="props">Outlined · weight 300<br/>opsz 24</span>
            </div>
            <div className="sample" style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="cloud">cloud</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="smart_toy">smart_toy</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="code_blocks">code_blocks</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="psychology">psychology</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="chat">chat</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="mail">mail</span>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }} title="arrow_outward">arrow_outward</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ § 03: BUTTONS ============ */}
      <section className="spec-section">
        <div className="section-head">
          <div className="num">§ 03</div>
          <h2>Buttons</h2>
          <div className="label">3 variants · light + dark contexts</div>
        </div>

        <div className="btn-spec-grid">
          {/* Variant 1: Primary Navy */}
          <div className="btn-spec-cell">
            <div className="head">
              <h3>Primary · Navy</h3>
              <span className="tag-meta">.btn .btn-primary</span>
            </div>
            <div className="row">
              <button className="btn btn-primary" onClick={() => showToast('Primary Button clicked')}>
                Get Started
              </button>
              <button className="btn btn-primary" onClick={() => showToast('Primary WhatsApp action triggered')}>
                <span className="material-symbols-outlined">chat</span>WhatsApp Me
              </button>
              <button className="btn btn-primary" style={{ background: '#1a3358' }} onClick={() => showToast('Simulated Hover clicked')}>
                Hover state
              </button>
            </div>
            <p className="desc">Default destination for confirmed actions. Dark Navy background, white text, 6px radius.</p>
          </div>

          {/* Variant 2: Outline Navy */}
          <div className="btn-spec-cell">
            <div className="head">
              <h3>Outline · Navy border</h3>
              <span className="tag-meta">.btn .btn-outline</span>
            </div>
            <div className="row">
              <button className="btn btn-outline" onClick={() => showToast('Outline Button clicked')}>
                Learn More
              </button>
              <button className="btn btn-outline" onClick={() => showToast('Outline Arrow action triggered')}>
                View Services<span className="material-symbols-outlined">arrow_outward</span>
              </button>
              <button className="btn btn-outline" style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-dark)' }} onClick={() => showToast('Simulated Hover clicked')}>
                Hover state
              </button>
            </div>
            <p className="desc">Secondary action. 1.5px navy border, transparent fill. Inverts to solid navy fill on hover.</p>
          </div>

          {/* Variant 3: Ghost Gold */}
          <div className="btn-spec-cell">
            <div className="head">
              <h3>Ghost · Gold border</h3>
              <span className="tag-meta">.btn .btn-ghost</span>
            </div>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => showToast('Ghost Button clicked')}>
                Read more
              </button>
              <button className="btn btn-ghost" onClick={() => showToast('Ghost Track Record clicked')}>
                Track Record
              </button>
              <button className="btn btn-ghost" style={{ background: 'var(--color-hover-overlay)' }} onClick={() => showToast('Simulated Hover clicked')}>
                Hover state
              </button>
            </div>
            <p className="desc">Tertiary, low-stakes navigation. Gold border, gold text on light surfaces. Subtle off-gold overlay on hover.</p>
          </div>

          {/* Variant 4: On Dark */}
          <div className="btn-spec-cell on-dark">
            <div className="head">
              <h3>On Dark · Featured</h3>
              <span className="tag-meta">on --color-primary</span>
            </div>
            <div className="row">
              <button className="btn btn-on-dark-primary" onClick={() => showToast('On-Dark Featured button clicked')}>
                Contact Me
              </button>
              <button className="btn btn-on-dark-primary" onClick={() => showToast('On-Dark WhatsApp clicked')}>
                <span className="material-symbols-outlined">chat</span>WhatsApp
              </button>
              <button className="btn btn-on-dark-outline" onClick={() => showToast('On-Dark Outline clicked')}>
                View Work
              </button>
            </div>
            <p className="desc">On navy backgrounds, the gold-fill button leads. Outlines use white borders at 30% opacity.</p>
          </div>
        </div>

        {/* Tag pills demonstration */}
        <div className="tag-row">
          <span className="tag" onClick={() => showToast('Tag clicked: Edge Platform')} style={{ cursor: 'pointer' }}>Edge Platform</span>
          <span className="tag tag-accent" onClick={() => showToast('Tag clicked: AI & WhatsApp')} style={{ cursor: 'pointer' }}>AI &amp; WhatsApp</span>
          <span className="tag" onClick={() => showToast('Tag clicked: Custom Software')} style={{ cursor: 'pointer' }}>Custom Software</span>
          <span className="tag tag-accent" onClick={() => showToast('Tag clicked: Hosting')} style={{ cursor: 'pointer' }}>Hosting</span>
          <span className="tag" onClick={() => showToast('Tag clicked: SME · Kuala Lumpur')} style={{ cursor: 'pointer' }}>SME · Kuala Lumpur</span>
        </div>
      </section>

      {/* ============ § 04: CARDS ============ */}
      <section className="spec-section">
        <div className="section-head">
          <div className="num">§ 04</div>
          <h2>Cards</h2>
          <div className="label">Light · Dark · Featured</div>
        </div>

        <div className="cards-spec-grid">
          {/* Card 1: Featured Service (2-column layout) */}
          <article className="spec-card feature">
            <div className="body">
              <span className="t-eyebrow" style={{ color: 'var(--color-accent)' }}>Featured Service</span>
              <h3 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)' }}>AI &amp; WhatsApp Automation</h3>
              <p style={{ color: 'var(--color-text-main)' }}>
                Conversational interfaces wired to your business systems. I build the glue between WhatsApp, your CRM, and the inbox you actually check.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={() => showToast('Case study clicked')}>
                  See case study
                </button>
                <button className="btn btn-ghost" onClick={() => showToast('Read more automation clicked')}>
                  Read more
                </button>
              </div>
            </div>
            <div className="img-placeholder" aria-hidden="true">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
          </article>

          {/* Card 2: Website & App Hosting */}
          <article className="spec-card" onClick={() => showToast('Hosting Card clicked')} style={{ cursor: 'pointer' }}>
            <div className="icon-mark">
              <span className="material-symbols-outlined">cloud</span>
            </div>
            <h3>Website &amp; App Hosting</h3>
            <p>Scalable, always-on hosting without a dedicated IT person. I handle deploys, monitoring, and the calls at 3am.</p>
            <div className="foot">
              <span>Always-on</span>
              <span className="material-symbols-outlined">arrow_outward</span>
            </div>
          </article>

          {/* Card 3: Custom Software */}
          <article className="spec-card" onClick={() => showToast('Custom Software Card clicked')} style={{ cursor: 'pointer' }}>
            <div className="icon-mark">
              <span className="material-symbols-outlined">code_blocks</span>
            </div>
            <h3>Custom Software</h3>
            <p>Off-the-shelf tools rarely fit the way your business actually works. I build the missing piece.</p>
            <div className="foot">
              <span>Bespoke</span>
              <span className="material-symbols-outlined">arrow_outward</span>
            </div>
          </article>

          {/* Card 4: System Integrations (Navy Variant) */}
          <article className="spec-card dark" onClick={() => showToast('Integrations Card clicked')} style={{ cursor: 'pointer' }}>
            <div className="icon-mark">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <h3>System Integrations</h3>
            <p>Internal tools, portals, and data-silo busters. The systems your team relies on, finally talking to each other.</p>
            <div className="foot">
              <span>Data unified</span>
              <span className="material-symbols-outlined">arrow_outward</span>
            </div>
          </article>

          {/* Card 5: Edge Platform */}
          <article className="spec-card" onClick={() => showToast('Edge Platform Card clicked')} style={{ cursor: 'pointer' }}>
            <span className="t-eyebrow" style={{ color: 'var(--color-text-muted)' }}>Track Record · 01</span>
            <h3>Edge Platform</h3>
            <p>Privilege of building and maintaining a platform that scales globally — and the hands-on experience to take a system from zero to one.</p>
            <div className="foot">
              <span>Case study</span>
              <span className="material-symbols-outlined">arrow_outward</span>
            </div>
          </article>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="page-footer">
        <div><strong>KONGMY Digital Solutions</strong> · Sapphire UI</div>
        <div>End of Visual Catalog · Vol. I</div>
      </footer>
    </div>
  )
}

export default App
