import { expect, test } from 'bun:test';
import { readExamples } from '../examples/catalog';
import { readElementExamples } from '../examples/elements';
import { cssReference, nativeReference, reactReference } from './api';
import { foundationGuides } from './foundations';
import { propReader } from './props';
import { hookGuide } from './utilities';

const root = process.cwd();
const read = propReader(root);

test('Input size keeps the Sapphire string union instead of numeric HTML size', () => {
  const size = read('input')[0]?.branches[0]?.props.find(
    (prop) => prop.name === 'size',
  );
  expect(size?.type).toContain('"sm"');
  expect(size?.type).not.toContain('number');
  expect(size?.platform).toBe(false);
  expect(size?.defaultValue).toBe("'default'");
});

test('omitted ThemeToggle props stay omitted while inherited React props stay grouped', () => {
  const props = read('theme-toggle')[0]?.branches[0]?.props ?? [];
  for (const omitted of ['onClick', 'icon', 'children', 'asChild'])
    expect(props.some((prop) => prop.name === omitted)).toBe(false);
  expect(props.find((prop) => prop.name === 'className')?.platform).toBe(true);
});

test('aliased Radix roots, composed exports and discriminated prop branches survive extraction', () => {
  const dialog = read('dialog');
  expect(
    dialog
      .find((item) => item.name === 'Dialog')
      ?.branches[0]?.props.some((prop) => prop.name === 'open'),
  ).toBe(true);
  expect(
    dialog
      .find((item) => item.name === 'DialogContent')
      ?.branches[0]?.props.some((prop) => prop.name === 'hideClose'),
  ).toBe(true);
  const accordion = read('accordion').find((item) => item.name === 'Accordion');
  const branches = accordion?.branches ?? [];
  expect(branches).toHaveLength(2);
  expect(
    branches.map(
      (branch) => branch.props.find((prop) => prop.name === 'value')?.type,
    ),
  ).toEqual(
    expect.arrayContaining(['string | undefined', 'string[] | undefined']),
  );
  expect(
    branches.every(
      (branch) => branch.props.find((prop) => prop.name === 'type')?.required,
    ),
  ).toBe(true);
});

test('every discovered catalogue entry has an API without embedding implementation source', () => {
  const names = new Set(readExamples(root).map((row) => row.component));
  for (const name of names) {
    const props = read(name);
    const html = props.length
      ? reactReference(props)
      : cssReference(root, name);
    expect(html.length, name).toBeGreaterThan(100);
    expect(html, name).toContain('<table');
    expect(html, name).not.toContain('export function');
  }
  for (const name of new Set(
    readElementExamples(root).map((row) => row.component),
  )) {
    const html = nativeReference(root, name);
    expect(html, name).toContain('Supported attributes');
    expect(html, name).not.toContain('connectedCallback');
  }
  const banner = nativeReference(root, 'banner');
  expect(banner).toContain('hidden');
  expect(banner).toContain('dismiss()');
  expect(banner).toContain('show()');
  expect(nativeReference(root, 'toast')).toContain('duration');
  const cookie = nativeReference(root, 'cookie-banner');
  for (const name of [
    'force-show',
    'heading',
    'description',
    'privacy-url',
    'privacy-label',
    'accept-label',
    'decline-label',
  ])
    expect(cookie).toContain(`<code>${name}</code>`);
});

test('foundation references retain visual depth and resolve current token values', () => {
  const guides = foundationGuides(root);
  const colors = guides.find((guide) => guide.route === 'colors')?.body ?? '';
  expect(colors.match(/class="docs-swatch"/g)).toHaveLength(42);
  expect(colors).toContain('#c5a065');
  const typography =
    guides.find((guide) => guide.route === 'typography')?.body ?? '';
  for (const family of ['Newsreader', 'Source Sans 3', 'JetBrains Mono'])
    expect(typography).toContain(family);
  expect(typography.match(/class="docs-type-sample"/g)).toHaveLength(8);
  expect(guides.find((guide) => guide.route === 'spacing')?.body).toContain(
    '--space-32',
  );
  expect(hookGuide().match(/<h2>use/g)).toHaveLength(6);
});

test('required data shapes and imperative ref methods remain discoverable without source', () => {
  const bar = read('segmented-bar');
  expect(
    bar
      .find((item) => item.name === 'SegmentedBarSegment')
      ?.branches[0]?.props.find((prop) => prop.name === 'value')?.required,
  ).toBe(true);
  expect(
    bar
      .find((item) => item.name === 'SegmentedBarMarker')
      ?.branches[0]?.props.some((prop) => prop.name === 'position'),
  ).toBe(true);
  const command = read('command-palette').find(
    (item) => item.name === 'CommandItem',
  );
  expect(command?.branches[0]?.props.map((prop) => prop.name)).toEqual(
    expect.arrayContaining(['id', 'label', 'hint', 'icon', 'onSelect']),
  );
  const toast = read('toast');
  expect(
    toast
      .find((item) => item.name === 'ToastRef')
      ?.branches[0]?.props.find((prop) => prop.name === 'show')?.type,
  ).toContain('message: string');
  expect(reactReference(toast)).toContain('durationMs');
  expect(
    read('wizard-layout')
      .find((item) => item.name === 'StepItem')
      ?.branches[0]?.props.some((prop) => prop.name === 'description'),
  ).toBe(true);
  const preference = read('theme-provider').find(
    (item) => item.name === 'ThemePreference',
  );
  expect(preference?.definition).toContain('"system"');
  expect(
    read('theme-provider').find((item) => item.name === 'Theme')?.definition,
  ).toContain('"dark"');
});
