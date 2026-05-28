import { useState } from 'react';

const tokenColors = [
  { name: '--color-primary', value: '#0a192f', label: 'Primary (Navy)' },
  { name: '--color-primary-hover', value: '#1a3358', label: 'Primary Hover' },
  { name: '--color-accent', value: '#c5a065', label: 'Accent (Gold)' },
  { name: '--color-accent-dark', value: '#b8904f', label: 'Accent Dark' },
  { name: '--color-surface', value: '#f4f6f8', label: 'Surface' },
  { name: '--color-text-main', value: '#1e293b', label: 'Text Main' },
  { name: '--color-text-muted', value: '#475569', label: 'Text Muted' },
  { name: '--color-text-on-dark', value: '#f1f5f9', label: 'Text on Dark' },
  { name: '--color-border', value: '#e2e8f0', label: 'Border' },
  { name: '--color-border-dark', value: 'rgba(255,255,255,0.12)', label: 'Border Dark' },
];

const statusColors = [
  { name: '--color-success', value: '#15803d', label: 'Success' },
  { name: '--color-error', value: '#b91c1c', label: 'Error' },
  { name: '--color-warning', value: '#b45309', label: 'Warning' },
  { name: '--color-info', value: '#1d4ed8', label: 'Info' },
];

function ColorSwatch({ name, value, label }: { name: string; value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const isDark = ['#0a192f', '#1a3358', '#1e293b'].includes(value);

  return (
    <button
      className="docs-preview"
      style={{ padding: 0, cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--color-border)', textAlign: 'left' }}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <div style={{ background: value, height: 80, width: '100%', position: 'relative' }}>
        {copied && (
          <span style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            fontFamily: 'var(--font-mono)', fontSize: 11, color: isDark ? 'white' : 'var(--color-text-strong)',
            background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)', padding: '2px 8px', borderRadius: 4,
          }}>
            Copied!
          </span>
        )}
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--color-text-strong)' }}>
          {label}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
          {name}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-subtle)' }}>
          {value}
        </div>
      </div>
    </button>
  );
}

export default function ColorsPage() {
  return (
    <div>
      <header className="docs-page-header">
        <h1>Colors</h1>
        <p>The Sapphire UI color palette. Click any swatch to copy its hex color code.</p>
      </header>

      <section className="docs-section">
        <h2 className="docs-section-title">Brand Colors</h2>
        <div className="docs-grid">
          {tokenColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
        </div>
      </section>

      <section className="docs-section">
        <h2 className="docs-section-title">Status Colors</h2>
        <div className="docs-grid">
          {statusColors.map((c) => <ColorSwatch key={c.name} {...c} />)}
        </div>
      </section>
    </div>
  );
}
