import { code, escapeHtml, table } from './html';

const hooks = [
  {
    entry: 'use-debounce',
    name: 'useDebounce',
    signature: 'useDebounce<T>(value: T, delayMs = 300): T',
    description:
      'Returns the initial value immediately, then waits for input to settle before updating. Useful for search queries; a new value restarts the timer.',
    sample: 'const debouncedQuery = useDebounce(query, 300);',
  },
  {
    entry: 'use-media-query',
    name: 'useMediaQuery',
    signature: 'useMediaQuery(query: string): boolean',
    description:
      'Subscribes to a media query. Starts false on the server and first render, then reads the browser match after mounting. Prefer CSS for layout changes.',
    sample:
      'const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");',
  },
  {
    entry: 'use-local-storage',
    name: 'useLocalStorage',
    signature:
      'useLocalStorage<T>(key: string, fallback: T, parse: (value: unknown) => T): [T, Dispatch<SetStateAction<T>>]',
    description:
      'Uses the fallback on the server and first render, then reads storage after mounting. The required parser validates stored JSON. Invalid or unavailable storage falls back safely; storage events sync other tabs.',
    sample:
      'const [compact, setCompact] = useLocalStorage(\n  "compact", false, (value) => value === true,\n);',
  },
  {
    entry: 'use-on-click-outside',
    name: 'useOnClickOutside',
    signature:
      'useOnClickOutside<T extends HTMLElement>(ref: RefObject<T | null>, handler: ((event: MouseEvent | TouchEvent | FocusEvent) => void) | null | false): void',
    description:
      'Listens for mouse down, touch start and focus moving outside the referenced element. Uses the composed event path for shadow DOM. Pass false or null to disable the handler.',
    sample:
      'const panelRef = useRef<HTMLDivElement>(null);\nuseOnClickOutside(panelRef, open ? () => setOpen(false) : false);',
  },
  {
    entry: 'use-copy-to-clipboard',
    name: 'useCopyToClipboard',
    signature:
      'useCopyToClipboard({ resetMs = 2000 } = {}): { copied: string | null; isCopied: boolean; copy(text: string): Promise<boolean> }',
    description:
      'Copies text with the browser Clipboard API. copy resolves false if access is unavailable or denied. Successful feedback resets after resetMs; use the returned boolean to report failures.',
    sample:
      'const { copy, isCopied } = useCopyToClipboard();\nconst succeeded = await copy("Hello");',
  },
  {
    entry: 'use-isomorphic-layout-effect',
    name: 'useIsomorphicLayoutEffect',
    signature:
      'useIsomorphicLayoutEffect(effect: EffectCallback, deps?: DependencyList): void',
    description:
      'Uses useLayoutEffect in a browser and useEffect on the server. Reserve it for measurements that must complete before paint; return a cleanup when subscribing.',
    sample:
      'useIsomorphicLayoutEffect(() => {\n  setWidth(panelRef.current?.getBoundingClientRect().width ?? 0);\n}, []);',
  },
];

export function hookGuide() {
  return `<p class="docs-lead">Six focused React hooks for state, browser capabilities and small interactions. Import only the hook you use. Each hook needs React as a peer.</p>${hooks.map((hook) => `<section class="docs-section" id="${hook.entry}"><h2>${hook.name}</h2><p>${hook.description}</p><div class="docs-example-stage sp-stack" data-hook-demo="${hook.entry}"></div>${table(`${hook.name} API`, ['Signature'], [[`<code>${escapeHtml(hook.signature)}</code>`]])}${code(`import { ${hook.name} } from "@kongmy-dev/sapphire-ui/hooks/${hook.entry}";\n\n${hook.sample}`)}</section>`).join('')}`;
}
