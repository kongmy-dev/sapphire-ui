import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Icon, materialSymbolsFontHref, materialSymbolsLinkTag } from '../Icon';

describe('Icon', () => {
  it('renders the icon name as text with the Material Symbols class', () => {
    render(<Icon name="cloud" />);
    expect(screen.getByText('cloud')).toHaveClass('material-symbols-outlined');
  });

  it('is hidden from assistive tech by default', () => {
    render(<Icon name="cloud" />);
    expect(screen.getByText('cloud')).toHaveAttribute('aria-hidden', 'true');
  });

  it('encodes size, fill and weight into fontVariationSettings', () => {
    render(<Icon name="star" size={32} filled weight={500} />);
    const el = screen.getByText('star');
    expect(el.style.fontSize).toBe('32px');
    expect(el.style.fontVariationSettings).toContain('"FILL" 1');
    expect(el.style.fontVariationSettings).toContain('"wght" 500');
    expect(el.style.fontVariationSettings).toContain('"opsz" 32');
  });

  it('uses FILL 0 and weight 300 by default', () => {
    render(<Icon name="home" />);
    const el = screen.getByText('home');
    expect(el.style.fontVariationSettings).toContain('"FILL" 0');
    expect(el.style.fontVariationSettings).toContain('"wght" 300');
  });

  it('merges custom className and inline style', () => {
    render(<Icon name="home" className="text-accent" style={{ color: 'red' }} />);
    const el = screen.getByText('home');
    expect(el).toHaveClass('text-accent');
    expect(el.style.color).toBe('red');
  });
});

describe('materialSymbolsFontHref', () => {
  it('returns the configured Google Fonts URL', () => {
    const href = materialSymbolsFontHref();
    expect(href).toContain('fonts.googleapis.com');
    expect(href).toContain('Material+Symbols+Outlined');
  });
});

describe('materialSymbolsLinkTag', () => {
  it('wraps the font href in a stylesheet link tag', () => {
    const tag = materialSymbolsLinkTag();
    expect(tag).toBe(`<link rel="stylesheet" href="${materialSymbolsFontHref()}" />`);
  });
});
