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
      `${css} /* .sp-button[data-variant="ghost"] {} */ .label { content: '.sp-button[data-variant="ghost"]' }`,
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
