import { expect, test } from 'bun:test';
import { contractGate } from './contract';
import { renderReport } from './report';

const source = (variant = 'primary | outline') => `
type Props = { variant?: ${variant
  .split(' | ')
  .map((value) => `'${value}'`)
  .join(' | ')} | null };
export function Button({variant = 'primary'}: Props) {
  return <button className="sp-button" data-slot="button" data-variant={variant ?? undefined}/>;
}`;
const css =
  '.sp-button { display: flex } .sp-button[data-variant="outline"] { border: 1px solid }';
const check = (text = source(), stylesheet = css) =>
  contractGate({
    root: '/project',
    files: [
      { name: 'components/button/button.tsx', text },
      { name: 'components/button/button.css', text: stylesheet },
    ],
  });

test('contract accepts a typed union with an explicit CSS base default', () => {
  expect(check().violations).toEqual([]);
});

test('contract fails when no runtime components are checked', () => {
  expect(renderReport(contractGate({ root: '/project', files: [] })).ok).toBe(
    false,
  );
});

test('contract rejects a real rendered class without a stylesheet selector', () => {
  expect(
    check(source().replace('sp-button', 'sp-buton')).violations[0],
  ).toMatchObject({
    file: 'components/button/button.tsx',
    rule: 'P-4',
  });
});

test('contract rejects a typed value with no selector', () => {
  expect(
    check(source('primary | outline | ghost')).violations[0]?.problem,
  ).toContain('ghost');
});

test('contract rejects a selector value absent from the declared union', () => {
  expect(
    check(source(), css.replace('outline', 'outlien')).violations.some(
      (issue) => issue.problem.includes('outlien'),
    ),
  ).toBe(true);
});

test('contract rejects broad strings and cannot guess an undeclared base default', () => {
  expect(
    check(source().replace("'primary' | 'outline'", 'string')).violations[0]
      ?.problem,
  ).toContain('unbounded');
  expect(
    check(source().replace("variant = 'primary'", 'variant')).violations[0]
      ?.problem,
  ).toContain('primary');
});

test('contract checks Radix state selectors against the actual imported primitive', () => {
  const dialog = `import { Dialog } from 'radix-ui'; export function Example(){return <Dialog.Content className="sp-dialog"/>}`;
  const stylesheet =
    '.sp-dialog { display: block } .sp-dialog[data-state="closed"] { opacity: 0 }';
  expect(check(dialog, stylesheet).violations).toEqual([]);
  expect(
    check(dialog, stylesheet.replace('closed', 'unchecked')).violations[0]
      ?.problem,
  ).toContain('unchecked');
  expect(
    check(dialog.replace('Dialog }', 'Checkbox }'), stylesheet).violations[0]
      ?.problem,
  ).toContain('closed');
});

test('contract ignores strings and comments that are not CSS selectors', () => {
  expect(
    check(
      source(),
      `${css} /* .sp-button[data-variant="ghost"] {} */ .label { content: '.sp-button[data-variant="ghost"] { display: block }' }`,
    ).violations,
  ).toEqual([]);
});

test('contract checks class arrays and conditional class expressions used by production components', () => {
  const array = source().replace(
    'className="sp-button"',
    `className={['sp-button', 'sp-typo'].filter(Boolean).join(' ')}`,
  );
  expect(check(array).violations[0]?.problem).toContain('sp-typo');
  const conditional = source().replace(
    'className="sp-button"',
    `className={variant === 'outline' ? 'sp-button' : 'sp-typo'}`,
  );
  expect(check(conditional).violations[0]?.problem).toContain('sp-typo');
});

test('contract accepts numeric base defaults and rejects other selector gaps', () => {
  const component =
    'export function Example({ cols = 3 }: { cols?: 1 | 2 | 3 }) { return <div className="sp-stat-group" data-cols={cols}/> }';
  const css =
    '.sp-stat-group {} .sp-stat-group[data-cols="1"] {} .sp-stat-group[data-cols="2"] {}';
  expect(check(component, css).violations).toEqual([]);
  expect(
    check(component.replace('cols = 3', 'cols = 2'), css).violations[0]
      ?.problem,
  ).toContain('3');
});

test('contract recognizes HoverCard open states without allowing unrelated states', () => {
  const component =
    'import { HoverCard } from "radix-ui"; export function Example(){ return <HoverCard.Content className="sp-hover-card"/> }';
  const css =
    '.sp-hover-card {} .sp-hover-card[data-state="open"] {} .sp-hover-card[data-state="closed"] {}';
  expect(check(component, css).violations).toEqual([]);
  expect(
    check(component, css.replace('closed', 'checked')).violations[0]?.problem,
  ).toContain('checked');
});

test('contract allows unstylized language metadata but rejects an unbounded styling domain', () => {
  const component =
    'export function Example({ language }: { language: string }) { return <pre className="sp-code" data-lang={language}/> }';
  expect(check(component, '.sp-code {}').violations).toEqual([]);
  expect(
    check(component, '.sp-code[data-lang="js"] {}').violations[0]?.problem,
  ).toContain('unbounded');
});

test('contract accepts finite conditional modifiers while rejecting unsupported branches', () => {
  const component = `export function Example({level, status}: {level: number; status: 'success' | 'error'}) { return <div className="sp-example" data-level={level === 3 ? 3 : undefined} data-status={status === 'success' ? undefined : status}/> }`;
  const stylesheet =
    '.sp-example {} .sp-example[data-level="3"] {} .sp-example[data-status="error"] {}';
  expect(check(component, stylesheet).violations).toEqual([]);
  expect(
    check(
      component.replace('3 : undefined', '4 : undefined'),
      stylesheet,
    ).violations.some((issue) => issue.problem.includes('value 4')),
  ).toBe(true);
});
