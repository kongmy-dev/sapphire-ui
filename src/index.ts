import './index.css';

// ─── Utilities ──────────────────────────────────────────────────────
export * from './lib/utils';
export * from './lib/consent';
export * from './lib/theme';

// ─── Hooks ──────────────────────────────────────────────────────────
export * from './hooks/useMediaQuery';
export * from './hooks/useDebounce';
export * from './hooks/useLocalStorage';
export * from './hooks/useCopyToClipboard';
export * from './hooks/useOnClickOutside';
export * from './hooks/useIsomorphicLayoutEffect';

// ─── Theming ────────────────────────────────────────────────────────
export * from './components/ThemeProvider';

// ─── Tier 1: Core Primitives ────────────────────────────────────────
export * from './components/ui/Button';
export * from './components/ui/Badge';
export * from './components/ui/Card';
export * from './components/ui/Input';
export * from './components/ui/Textarea';
export * from './components/ui/Label';
export * from './components/ui/Separator';
export * from './components/ui/Icon';
export * from './components/ui/Checkbox';
export * from './components/ui/ToggleSwitch';
export * from './components/ui/RangeSlider';
export * from './components/ui/NativeSelect';

// ─── Tier 2: Feedback & Data Display ────────────────────────────────
export * from './components/ui/Skeleton';
export * from './components/ui/Spinner';
export * from './components/ui/Progress';
export * from './components/ui/Avatar';
export * from './components/ui/AvatarGroup';
export * from './components/ui/Table';
export * from './components/ui/Tabs';
export * from './components/ui/Alert';
export * from './components/ui/Empty';
export * from './components/ui/Stat';

// ─── Phase 3 Extended: Visual + Interactive Primitives ──────────────
export * from './components/ui/Breadcrumb';
export * from './components/ui/Pagination';
export * from './components/ui/Kbd';
export * from './components/ui/Chip';
export * from './components/ui/CodeBlock';
export * from './components/ui/Toggle';
export * from './components/ui/ScrollArea';
export * from './components/ui/HoverCard';
export * from './components/Banner';
export * from './components/BannerElement';

// ─── Phase 1 Core Completion: Selection + Disclosure + Composition ──
export * from './components/ui/Popover';
export * from './components/ui/Tooltip';
export * from './components/ui/Sheet';
export * from './components/ui/Select';
export * from './components/ui/DropdownMenu';
export * from './components/ui/RadioGroup';
export * from './components/ui/Accordion';
export * from './components/ui/FormField';

// ─── Docs / DX primitives ───────────────────────────────────────────
export * from './components/CommandPalette';

// ─── Tier 3: Interactive Primitives ─────────────────────────────────
export * from './components/ui/Dialog';
export * from './components/Toast';
export * from './components/ToastElement';

// ─── Tier 4: Composites & Layouts ───────────────────────────────────
export * from './components/ui/Layout';
export * from './components/ui/PageSection';
export * from './components/ui/SiteHeader';
export * from './components/ui/SiteFooter';
export * from './components/ui/SEOHead';

// ─── Ecosystem ──────────────────────────────────────────────────────
export * from './components/CookieBanner';
export * from './components/CookieBannerElement';
export * from './components/Analytics';
export * from './components/AnalyticsElement';
export * from './components/ui/MobileNav';
