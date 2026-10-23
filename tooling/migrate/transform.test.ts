import { expect, it } from 'bun:test';
import { migrateText } from './transform.js';

it('preserves named expression shadows and reports indirect component aliases', () => {
  const prefix = 'import { Button } from "@kongmy-dev/sapphire-ui/button"; ';
  for (const expression of [
    'function Button(){return <Button variant="accent"/>}',
    'class Button{render(){return <Button variant="accent"/>}}',
  ]) {
    const text = `${prefix}const local = ${expression};`;
    const result = migrateText('view.tsx', text);
    expect(result.text).toBe(text);
    expect(result.issues[0]?.message).toContain('shadow');
  }
  expect(
    migrateText(
      'view.tsx',
      `${prefix}const Other = Button; const view = <Other variant="accent"/>;`,
    ).issues[0]?.message,
  ).toContain('Aliased');
  expect(
    migrateText('view.html', '<button CLASS="btn-outline"/>').text,
  ).toContain('data-variant="outline"');
});

it('reports parser and removed helper work at aliased imports without guessing data shapes', () => {
  const text =
    'import { useLocalStorage as useSaved } from "@kongmy-dev/sapphire-ui/hooks/use-local-storage"; import { buttonVariants } from "@kongmy-dev/sapphire-ui/button";';
  const result = migrateText('app.ts', text);
  expect(result.text).toBe(text);
  expect(result.issues.map((issue) => issue.message).join('\n')).toContain(
    'parser',
  );
  expect(result.issues.map((issue) => issue.message).join('\n')).toContain(
    'variant helpers',
  );
});

it('migrates literal HTML class lists into deduplicated classes and data attributes', () => {
  const result = migrateText(
    'index.html',
    '<button class="btn btn-outline btn-sm">Save</button>',
  );
  expect(result.text).toBe(
    '<button class="sp-button" data-variant="outline" data-size="sm">Save</button>',
  );
  expect(result.issues).toEqual([]);
  expect(migrateText('index.html', result.text).text).toBe(result.text);
  expect(
    migrateText('index.html', '<button class=btn-outline>Save</button>').text,
  ).toBe('<button class="sp-button" data-variant="outline">Save</button>');
});

it('preserves conflicts, dynamic classes, entity encoding and ambiguous global classes', () => {
  for (const text of [
    '<button class="btn-outline" data-variant="brand"/>',
    '<button class="btn-outline btn-accent"/>',
    '<button className={classes}/>',
    '<button class="btn&#32;btn-outline"/>',
  ]) {
    const result = migrateText(
      text.includes('className') ? 'view.tsx' : 'view.html',
      text,
    );
    expect(result.text).toBe(text);
    expect(result.issues.length).toBeGreaterThan(0);
  }
  const result = migrateText(
    'index.html',
    '<main class="dark section material-symbols-outlined">home</main>',
  );
  expect(result.text).toContain(
    'class="dark section material-symbols-outlined"',
  );
  expect(result.issues).toHaveLength(3);
});

it('uses imported component identity and aliases for prop values while leaving local components alone', () => {
  const text =
    'import { Button as Action } from "@kongmy-dev/sapphire-ui/button"; const view = <><Action variant="accent"/><Button variant="accent"/></>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toContain('<Action variant="brand"/>');
  expect(result.text).toContain('<Button variant="accent"/>');
  expect(result.issues).toEqual([]);
  expect(migrateText('view.tsx', result.text).text).toBe(result.text);
});

it('migrates removed Button variants through imported aliases', () => {
  const text =
    'import { Button as Action } from "@kongmy-dev/sapphire-ui/button"; const view = <><Action variant="premium"/><Action variant="on-dark-primary"/><Action variant="on-dark-outline"/></>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(
    'import { Button as Action } from "@kongmy-dev/sapphire-ui/button"; const view = <><Action variant="brand"/><Action variant="brand"/><Action variant="outline"/></>;',
  );
  expect(result.issues).toEqual([]);
  expect(migrateText('view.tsx', result.text).text).toBe(result.text);
});

it('reports removed admin collapse props without guessing state ownership', () => {
  const text =
    'import { AdminSidebar as Sidebar, AdminSidebarSection, AdminSidebarLink } from "@kongmy-dev/sapphire-ui/admin-layout"; const view = <Sidebar collapsed={compact} onToggleCollapse={toggle}><AdminSidebarSection collapsed={compact}><AdminSidebarLink collapsed={compact} href="/">Home</AdminSidebarLink></AdminSidebarSection></Sidebar>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues).toHaveLength(4);
  expect(
    result.issues.filter((issue) => issue.message.includes('collapsed')),
  ).toHaveLength(3);
  expect(
    result.issues.some((issue) => issue.message.includes('onToggleCollapse')),
  ).toBe(true);
  expect(
    result.issues.every((issue) => issue.message.includes('AdminLayout')),
  ).toBe(true);
});

it('does not apply DOM data modifiers to a React component that owns those attributes', () => {
  const text =
    'import { Button } from "@kongmy-dev/sapphire-ui/button"; const view = <Button className="btn-outline"/>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues[0]?.message).toContain('public props');
});

it('leaves escaped string expressions valid and does not parse TypeScript generics as JSX', () => {
  const escaped =
    'const view = <div className={"hello\\"world btn-outline"}/>;';
  const result = migrateText('view.tsx', escaped);
  expect(result.text).toBe(escaped);
  expect(result.issues[0]?.message).toContain('manual migration');
  const generic =
    'const choose = <T>(value: T) => value; const text = \'<div class="btn-outline">\';';
  expect(migrateText('view.ts', generic).text).toBe(generic);
  expect(migrateText('view.ts', generic).issues).toEqual([]);
});

it('preserves malformed source and reports the parse location', () => {
  const text = 'const view = <div className="btn-outline"';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues[0]?.message).toContain('parsed safely');
  expect(result.issues[0]?.line).toBe(1);
});

it('rejects shadowed imported aliases and unrelated package prefixes conservatively', () => {
  const text =
    'import { Button as Action } from "@kongmy-dev/sapphire-ui/button"; function View({ Action }: { Action: typeof Button }) { return <Action variant="accent"/>; }';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues[0]?.message).toContain('shadow');
  const other =
    'import { Button } from "@kongmy-dev/sapphire-ui-tools"; const view = <Button variant="accent"/>;';
  expect(migrateText('view.tsx', other)).toEqual({
    text: other,
    changes: 0,
    issues: [],
  });
});

it('reports root, namespace, removed entrypoints, CommonJS and dynamic prop values', () => {
  const text =
    'import * as UI from "@kongmy-dev/sapphire-ui"; import "@kongmy-dev/sapphire-ui/icon"; const value = require("@kongmy-dev/sapphire-ui/button"); const view = <UI.Button variant="accent"/>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues.length).toBeGreaterThanOrEqual(4);
  const spread =
    'import { Button } from "@kongmy-dev/sapphire-ui/button"; const view = <Button {...{ variant: "accent", icon: "home" }}/>;';
  expect(migrateText('view.tsx', spread).issues[0]?.message).toContain(
    'spread',
  );
});

it('migrates static subpath imports, reexports and dynamic imports without rewriting arbitrary strings', () => {
  const text =
    'import { ToggleSwitch } from "@kongmy-dev/sapphire-ui/toggle-switch"; export { ToggleSwitch } from "@kongmy-dev/sapphire-ui/toggle-switch"; const module = import("@kongmy-dev/sapphire-ui/toggle-switch"); const untouched = "@kongmy-dev/sapphire-ui/toggle-switch";';
  const result = migrateText('view.ts', text);
  expect(result.text.match(/sapphire-ui\/switch/g)).toHaveLength(3);
  expect(result.text).toContain(
    'const untouched = "@kongmy-dev/sapphire-ui/toggle-switch"',
  );
});

it('keeps utility variants and opacity, ignores custom class prefixes and is idempotent at accent boundaries', () => {
  const text =
    '<div class="hover:text-accent-text/80 bg-hover-overlay brand-bg-accent hero-text-text-muted"/>';
  const result = migrateText('view.html', text);
  expect(result.text).toContain(
    'hover:text-brand-text/80 bg-accent brand-bg-accent hero-text-text-muted',
  );
  const again = migrateText('view.html', result.text);
  expect(again.text).toBe(result.text);
  expect(again.issues[0]?.message).toContain('quiet surface');
});

it('skips HTML comments, raw scripts and RCDATA even when they contain markup-like text', () => {
  const text =
    '<!-- <button class="btn-outline"> --><SCRIPT>const text = \'<div class="btn-outline">\';</SCRIPT><textarea>Use <div class="btn-outline"> here</textarea><title><div class="btn-outline"></title><div title="<button class=btn-outline>">Text</div>';
  const result = migrateText('index.html', text);
  expect(result.text).toBe(text);
  expect(result.issues).toEqual([]);
});

it('migrates Astro template classes and import-aware props but reports unsupported embedded contexts', () => {
  const text =
    '---\nimport { Button as Action } from "@kongmy-dev/sapphire-ui/button";\nconst raw = \'<div class="btn-outline">\';\n---\n<Action variant="accent"/><button class="btn-outline"/>{true && <Action variant="accent"/>}\n<style>.x {color:var(--color-primary)}</style>';
  const result = migrateText('page.astro', text);
  expect(result.text).toContain('<Action variant="brand"/>');
  expect(result.text).toContain(
    '<button class="sp-button" data-variant="outline"/>',
  );
  expect(result.text).toContain('{true && <Action variant="accent"/>}');
  expect(result.text).toContain('const raw = \'<div class="btn-outline">\'');
  expect(
    result.issues.some((issue) => issue.message.includes('Embedded template')),
  ).toBe(true);
  expect(
    result.issues.some((issue) => issue.message.includes('Embedded style')),
  ).toBe(true);
});

it('reports manual icons, filled options, ThemeToggle child slots and inline tokens', () => {
  const text =
    'import { Button } from "@kongmy-dev/sapphire-ui/button"; import { IconMark } from "@kongmy-dev/sapphire-ui/icon-mark"; import { ThemeToggle } from "@kongmy-dev/sapphire-ui/theme-toggle"; const view = <><Button icon={glyph}/><IconMark filled/><ThemeToggle asChild/><div style={{color:"var(--color-primary)"}}/></>;';
  const result = migrateText('view.tsx', text);
  expect(result.text).toBe(text);
  expect(result.issues).toHaveLength(4);
  expect(
    migrateText(
      'index.html',
      '<sapphire-banner variant="accent" icon="home"></sapphire-banner>',
    ).issues[0]?.message,
  ).toContain('SVG');
});

it('renames CSS tokens and overrides without altering strings, comments, URLs or selector names', () => {
  const text =
    ':root { --color-primary: red; --toast-accent: var(--color-accent); } .--color-primary { content: "--color-accent"; background: url(/--color-primary.svg); color: var(--color-text-main); } /* --color-primary */ @import "@kongmy-dev/sapphire-ui/theme.css";';
  const result = migrateText('app.css', text);
  expect(result.text).toContain(
    '--primary: red; --sp-toast-accent: var(--brand)',
  );
  expect(result.text).toContain('.--color-primary');
  expect(result.text).toContain('content: "--color-accent"');
  expect(result.text).toContain('url(/--color-primary.svg)');
  expect(result.text).toContain('var(--foreground)');
  expect(result.issues[0]?.message).toContain('theme.css');
  expect(migrateText('app.css', result.text).text).toBe(result.text);
});

it('migrates exact colour utility families while preserving variants and opacity', () => {
  const families = [
    'border-x',
    'border-y',
    'border-s',
    'border-e',
    'border-t',
    'border-r',
    'border-b',
    'border-l',
    'ring-offset',
    'inset-ring',
    'inset-shadow',
    'text-shadow',
    'caret',
    'accent',
    'from',
    'via',
    'to',
  ];
  for (const family of families) {
    const before = `<div class="dark:hover:${family}-text-muted/80"/>`;
    const result = migrateText('index.html', before);
    expect(result.text).toBe(
      `<div class="dark:hover:${family}-muted-foreground/80"/>`,
    );
    expect(result.issues).toEqual([]);
    expect(migrateText('index.html', result.text).text).toBe(result.text);
    const ambiguous = `<div class="hover:${family}-accent/50"/>`;
    expect(migrateText('index.html', ambiguous).text).toBe(ambiguous);
    expect(migrateText('index.html', ambiguous).issues).toHaveLength(1);
    const custom = `<div class="custom-${family}-text-muted"/>`;
    expect(migrateText('index.html', custom)).toEqual({
      text: custom,
      changes: 0,
      issues: [],
    });
  }
  const identities =
    '<div class="font-serif text-heading leading-snug rounded-lg shadow-card-hover"/>';
  expect(migrateText('index.html', identities)).toEqual({
    text: identities,
    changes: 0,
    issues: [],
  });
});

it('does not migrate token-shaped payloads inside escaped unquoted CSS URLs', () => {
  const source =
    '.hero { background: url(foo\\);--color-primary:bar); color: var(--color-text-main); }';
  const result = migrateText('app.css', source);
  expect(result.text).toBe(
    source.replace('var(--color-text-main)', 'var(--foreground)'),
  );
  expect(result.issues).toEqual([]);
});
