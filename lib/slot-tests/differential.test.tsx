import { expect, it } from 'bun:test';
import type { CSSProperties } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { implementations, type SlotComponent } from './impls.js';

type Bag = Record<string, unknown>;

const classNames: readonly Bag[] = [
  {},
  { className: undefined },
  { className: '' },
  { className: 'x' },
];
const styles: readonly Bag[] = [
  {},
  { style: undefined },
  { style: { color: 'red', width: '1px' } satisfies CSSProperties },
  { style: { color: 'blue' } satisfies CSSProperties },
];
const describedBys: readonly Bag[] = [
  {},
  { 'aria-describedby': undefined },
  { 'aria-describedby': '' },
  { 'aria-describedby': ' a  b ' },
  { 'aria-describedby': 'b c a' },
];
const dataAttributes: readonly Bag[] = [
  {},
  { 'data-x': undefined },
  { 'data-x': 'value' },
];
const dimensions = [classNames, styles, describedBys, dataAttributes] as const;

function capture(Slot: SlotComponent, slotProps: Bag, childProps: Bag) {
  let captured: Bag = {};
  function Probe(props: Bag) {
    captured = props;
    return null;
  }
  renderToStaticMarkup(
    <Slot {...slotProps}>
      <Probe {...childProps} />
    </Slot>,
  );
  return captured;
}

function shape(props: Bag) {
  return Object.entries(props)
    .filter(
      ([key, value]) =>
        key !== 'ref' || (value !== null && value !== undefined),
    )
    .map(([key, value]) => [
      key,
      typeof value === 'function' ? 'function' : value,
    ]);
}

function markup(Slot: SlotComponent, slotProps: Bag, childProps: Bag) {
  return renderToStaticMarkup(
    <Slot {...slotProps}>
      <a href="/x" {...childProps}>
        t
      </a>
    </Slot>,
  );
}

function allBags(): readonly Bag[] {
  return dimensions.reduce<readonly Bag[]>(
    (bags, options) =>
      bags.flatMap((bag) => options.map((option) => ({ ...bag, ...option }))),
    [{}],
  );
}

function implementation(index: number) {
  const found = implementations[index];
  if (!found) throw new Error('implementations missing');
  return found;
}
const radix = implementation(0);
const lib = implementation(1);

const handlerNames = ['onClick', 'onKeyDown', 'onPointerEnter', 'only'];
const handlerStates = ['absent', 'function', 'undefined'] as const;
const handlerPairs = handlerStates.flatMap((slotState) =>
  handlerStates.map((childState) => ({ slotState, childState })),
);

function handlerOutcome(
  Slot: SlotComponent,
  name: string,
  slotState: (typeof handlerStates)[number],
  childState: (typeof handlerStates)[number],
) {
  const log: string[] = [];
  const bagFor = (label: string, state: (typeof handlerStates)[number]) => {
    if (state === 'absent') return {};
    if (state === 'undefined') return { [name]: undefined };
    return {
      [name]: (...args: unknown[]) => {
        log.push(`${label}(${args.join(',')})`);
        return `${label}-result`;
      },
    };
  };
  const captured = capture(
    Slot,
    bagFor('slot', slotState),
    bagFor('child', childState),
  );
  const merged = captured[name];
  const returned =
    typeof merged === 'function' ? merged('a', 'b') : String(merged);
  return { type: typeof merged, returned, log };
}

function compareBags(bags: readonly Bag[]) {
  let compared = 0;
  for (const slotBag of bags) {
    for (const childBag of bags) {
      comparePair(slotBag, childBag);
      compared++;
    }
  }
  return compared;
}

function comparePair(slotBag: Bag, childBag: Bag) {
  const actual = shape(capture(lib.Slot, slotBag, childBag));
  const expected = shape(capture(radix.Slot, slotBag, childBag));
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    expect(actual).toEqual(expected);
  const actualMarkup = markup(lib.Slot, slotBag, childBag);
  const expectedMarkup = markup(radix.Slot, slotBag, childBag);
  if (actualMarkup !== expectedMarkup)
    expect(actualMarkup).toBe(expectedMarkup);
}

function checkDimension(options: readonly Bag[]) {
  for (const slotBag of options) {
    for (const childBag of options) {
      expect(shape(capture(lib.Slot, slotBag, childBag))).toEqual(
        shape(capture(radix.Slot, slotBag, childBag)),
      );
      expect(markup(lib.Slot, slotBag, childBag)).toBe(
        markup(radix.Slot, slotBag, childBag),
      );
    }
  }
}

for (const [dimensionIndex, options] of dimensions.entries()) {
  it(`merged props are identical for every slot/child pair of dimension ${dimensionIndex} (${options.length * options.length} pairs)`, () => {
    checkDimension(options);
  });
}

it('merged props and markup are identical for every full slot/child bag pair', () => {
  const bags = allBags();
  const compared = compareBags(bags);
  expect(bags.length).toBe(240);
  expect(compared).toBe(57600);
});

for (const name of handlerNames) {
  it(`handler ${name}: order, arguments and return value match for all 9 slot/child states`, () => {
    for (const { slotState, childState } of handlerPairs) {
      expect(handlerOutcome(lib.Slot, name, slotState, childState)).toEqual(
        handlerOutcome(radix.Slot, name, slotState, childState),
      );
    }
  });
}

it('without any ref, radix hands a function-component child ref: null and lib leaves the key out', () => {
  const radixProps = capture(radix.Slot, { className: 's' }, {});
  const libProps = capture(lib.Slot, { className: 's' }, {});
  expect('ref' in radixProps).toBe(true);
  expect(radixProps.ref).toBeNull();
  expect('ref' in libProps).toBe(false);
});

it('handler order and return value are the documented ones', () => {
  const outcome = handlerOutcome(lib.Slot, 'onClick', 'function', 'function');
  expect(outcome.log).toEqual(['child(a,b)', 'slot(a,b)']);
  expect(outcome.returned).toBe('child-result');
});
