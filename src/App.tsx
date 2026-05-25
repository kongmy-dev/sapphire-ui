import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import pkg from '../package.json';
import './App.css';

const DOCS_VERSION = `v${pkg.version}`;

// Pages — lazy-loaded so each page ships in its own chunk
const OverviewPage = lazy(() => import('./pages/OverviewPage'));
const ColorsPage = lazy(() => import('./pages/ColorsPage'));
const TypographyPage = lazy(() => import('./pages/TypographyPage'));
const ButtonsPage = lazy(() => import('./pages/ButtonsPage'));
const CardsPage = lazy(() => import('./pages/CardsPage'));
const FormsPage = lazy(() => import('./pages/FormsPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const DataPage = lazy(() => import('./pages/DataPage'));
const InteractivePage = lazy(() => import('./pages/InteractivePage'));
const ExtendedPage = lazy(() => import('./pages/ExtendedPage'));
const HooksPage = lazy(() => import('./pages/HooksPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

import { CookieBanner } from './components/CookieBanner';
import { Analytics } from './components/Analytics';
import { MobileNav } from './components/ui/MobileNav';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { CommandPalette, type CommandItem } from './components/CommandPalette';
import { Kbd } from './components/ui/Kbd';
import { Layout } from './components/ui/Layout';

const navItems = [
  { href: '/', label: 'Overview', icon: 'home' },
  { href: '/colors', label: 'Colors', icon: 'palette' },
  { href: '/typography', label: 'Typography', icon: 'text_fields' },
  { href: '/buttons', label: 'Buttons', icon: 'smart_button' },
  { href: '/cards', label: 'Cards', icon: 'cards' },
  { href: '/forms', label: 'Forms', icon: 'input' },
  { href: '/feedback', label: 'Feedback', icon: 'notifications' },
  { href: '/data', label: 'Data Display', icon: 'table_chart' },
  { href: '/interactive', label: 'Interactive', icon: 'touch_app' },
  { href: '/extended', label: 'Extended', icon: 'extension' },
  { href: '/hooks', label: 'Hooks & Utils', icon: 'function' },
  { href: '/admin', label: 'Admin Layout', icon: 'admin_panel_settings' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="docs-nav-link w-full cursor-pointer border-none bg-transparent text-left"
      style={{ outline: 'none' }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
      Theme: {theme}
    </button>
  );
}

function AppShell() {
  const [showCookies, setShowCookies] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const commands: CommandItem[] = navItems.map((item) => ({
    id: item.href,
    label: item.label,
    hint: item.href,
    icon: item.icon,
    onSelect: () => navigate(item.href),
  }));

  return (
    <>
      {/* Mobile Drawer Navigation */}
      <MobileNav
        brandName="Sapphire"
        brandSuffix="UI"
        version={DOCS_VERSION}
        navItems={navItems}
        onNavigate={(href, event) => {
          // Intercept clicks so React Router handles routing without
          // a full page reload.
          event.preventDefault();
          navigate(href);
        }}
        extraActions={
          <button
            onClick={() => setShowCookies(true)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-md border-none bg-transparent px-4 py-2.5 text-left font-sans text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            style={{ outline: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              cookie
            </span>
            Cookie Settings
          </button>
        }
      />

      <Layout
        className="docs-layout"
        mainClassName="docs-main"
        sidebar={
        <aside className="docs-sidebar">
          <div className="docs-sidebar-brand">
            <span className="docs-brand-name">Sapphire</span>
            <span className="docs-brand-suffix">UI</span>
          </div>
          <div className="docs-brand-version">{DOCS_VERSION}</div>
          <nav className="docs-nav">
            {/* Search — pinned to top so the keyboard-driven jump path
                is the first thing in the visual hierarchy. */}
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              className="docs-nav-link w-full cursor-pointer border-none bg-transparent text-left"
              style={{ outline: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                search
              </span>
              <span style={{ flex: 1 }}>Search</span>
              <Kbd size="sm">⌘K</Kbd>
            </button>

            <hr className="docs-nav-divider" />

            {/* Page links — the catalog */}
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  `docs-nav-link ${isActive ? 'docs-nav-link--active' : ''}`
                }
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}

            {/* Bottom group — utility actions, pinned to the bottom so
                they read as preferences rather than additional pages. */}
            <div className="docs-nav-bottom pb-4">
              <hr className="docs-nav-divider" />
              <ThemeToggle />
              <button
                onClick={() => setShowCookies(true)}
                className="docs-nav-link w-full cursor-pointer border-none bg-transparent text-left"
                style={{ outline: 'none' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  cookie
                </span>
                Cookie Settings
              </button>
            </div>
          </nav>
          <div className="docs-sidebar-footer">
            <span className="docs-footer-text">KONGMY Digital Solutions</span>
          </div>
        </aside>
        }
      >
        <Suspense fallback={
          <div style={{ padding: '2rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)', fontSize: 14 }}>
            Loading…
          </div>
        }>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/typography" element={<TypographyPage />} />
            <Route path="/buttons" element={<ButtonsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/interactive" element={<InteractivePage />} />
            <Route path="/extended" element={<ExtendedPage />} />
            <Route path="/hooks" element={<HooksPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </Layout>

      <CookieBanner forceShow={showCookies} onClose={() => setShowCookies(false)} />
      <Analytics
        gaId={import.meta.env.VITE_PUBLIC_GA_ID}
        posthogToken={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      />
      <CommandPalette
        items={commands}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        placeholder="Jump to a section…"
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultPreference="light">
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
