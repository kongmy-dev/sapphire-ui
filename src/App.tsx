import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';

// Pages
import OverviewPage from './pages/OverviewPage';
import ColorsPage from './pages/ColorsPage';
import TypographyPage from './pages/TypographyPage';
import ButtonsPage from './pages/ButtonsPage';
import CardsPage from './pages/CardsPage';
import FormsPage from './pages/FormsPage';
import FeedbackPage from './pages/FeedbackPage';
import DataPage from './pages/DataPage';

import { CookieBanner } from './components/CookieBanner';
import { Analytics } from './components/Analytics';
import { MobileNav } from './components/ui/MobileNav';

const navItems = [
  { to: '/', label: 'Overview', icon: 'home' },
  { to: '/colors', label: 'Colors', icon: 'palette' },
  { to: '/typography', label: 'Typography', icon: 'text_fields' },
  { to: '/buttons', label: 'Buttons', icon: 'smart_button' },
  { to: '/cards', label: 'Cards', icon: 'cards' },
  { to: '/forms', label: 'Forms', icon: 'input' },
  { to: '/feedback', label: 'Feedback', icon: 'notifications' },
  { to: '/data', label: 'Data Display', icon: 'table_chart' },
];

export default function App() {
  const [showCookies, setShowCookies] = useState(false);

  return (
    <BrowserRouter>
      {/* Mobile Drawer Navigation */}
      <MobileNav
        brandName="Sapphire"
        brandSuffix="UI"
        version="v0.1.0"
        navItems={navItems}
        extraActions={
          <button
            onClick={() => setShowCookies(true)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-sans text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/5 w-full border-none bg-transparent cursor-pointer text-left"
            style={{ outline: 'none' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              cookie
            </span>
            Cookie Settings
          </button>
        }
      />

      <div className="docs-layout">
        {/* Sidebar */}
        <aside className="docs-sidebar">
          <div className="docs-sidebar-brand">
            <span className="docs-brand-name">Sapphire</span>
            <span className="docs-brand-suffix">UI</span>
          </div>
          <div className="docs-brand-version">v0.1.0</div>
          <nav className="docs-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
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
            
            {/* Cookie Settings Button */}
            <button
              onClick={() => setShowCookies(true)}
              className="docs-nav-link w-full border-none bg-transparent cursor-pointer text-left"
              style={{ outline: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                cookie
              </span>
              Cookie Settings
            </button>
          </nav>
          <div className="docs-sidebar-footer">
            <span className="docs-footer-text">KONGMY Digital Solutions</span>
          </div>
        </aside>

        {/* Main */}
        <main className="docs-main">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/colors" element={<ColorsPage />} />
            <Route path="/typography" element={<TypographyPage />} />
            <Route path="/buttons" element={<ButtonsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/data" element={<DataPage />} />
          </Routes>
        </main>
      </div>

      <CookieBanner forceShow={showCookies} onClose={() => setShowCookies(false)} />
      <Analytics
        gaId={import.meta.env.VITE_PUBLIC_GA_ID}
        posthogToken={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      />
    </BrowserRouter>
  );
}
