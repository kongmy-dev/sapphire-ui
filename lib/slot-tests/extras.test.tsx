import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, Fragment, type Ref } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeBadge, makeButton, makeForwardRefButton } from './fixtures.js';
import { implementations, type SlotComponent } from './impls.js';

type RefKind = 'none' | 'callback' | 'object' | 'cleanup';
const refKinds: readonly RefKind[] = ['none', 'callback', 'object', 'cleanup'];
const refPairs = refKinds.flatMap((slotKind) =>
  refKinds.map((childKind) => ({ slotKind, childKind })),
);

type Tracked<T extends HTMLElement> = {
  readonly ref: Ref<T> | undefined;
  readonly events: string[];
  readonly holder: { current: T | null };
};

function trackedRef<T extends HTMLElement>(
  label: string,
  kind: RefKind,
): Tracked<T> {
  const events: string[] = [];
  const holder = createRef<T>();
  if (kind === 'none') return { ref: undefined, events, holder };
  if (kind === 'object') return { ref: holder, events, holder };
  if (kind === 'callback') {
    return {
      ref: (node) => {
        events.push(`${label}:${node ? node.tagName : 'null'}`);
      },
      events,
      holder,
    };
  }
  return {
    ref: (node) => {
      events.push(`${label}:${node ? node.tagName : 'null'}`);
      return () => {
        events.push(`${label}:cleanup`);
      };
    },
    events,
    holder,
  };
}

function expectAttached(
  tracked: Tracked<HTMLElement>,
  kind: RefKind,
  node: HTMLElement,
) {
  if (kind === 'object') expect(tracked.holder.current).toBe(node);
}

function expectReleased(
  tracked: Tracked<HTMLElement>,
  kind: RefKind,
  label: string,
) {
  if (kind === 'object') expect(tracked.holder.current).toBeNull();
  if (kind === 'callback')
    expect(tracked.events).toEqual([`${label}:BUTTON`, `${label}:null`]);
  if (kind === 'cleanup')
    expect(tracked.events).toEqual([`${label}:BUTTON`, `${label}:cleanup`]);
}

for (const { name, Slot } of implementations) {
  describe(`${name}: refs`, () => {
    for (const { slotKind, childKind } of refPairs) {
      it(`slot ref ${slotKind}, child ref ${childKind}: both get the node, then release it`, () => {
        const slotRef = trackedRef<HTMLElement>('slot', slotKind);
        const childRef = trackedRef<HTMLButtonElement>('child', childKind);
        const { unmount } = render(
          <Slot ref={slotRef.ref}>
            <button type="button" ref={childRef.ref}>
              hi
            </button>
          </Slot>,
        );
        expectAttached(slotRef, slotKind, screen.getByRole('button'));
        expectAttached(childRef, childKind, screen.getByRole('button'));
        unmount();
        expectReleased(slotRef, slotKind, 'slot');
        expectReleased(childRef, childKind, 'child');
      });
    }

    it('a callback ref and an object ref both receive the node', () => {
      const callback = mock((_node: HTMLElement | null) => {});
      const objectRef = createRef<HTMLButtonElement>();

      render(
        <Slot ref={callback}>
          <button type="button" ref={objectRef}>
            hi
          </button>
        </Slot>,
      );
      const button = screen.getByRole('button');
      expect(callback).toHaveBeenCalledWith(button);
      expect<HTMLElement | null>(objectRef.current).toBe(button);
    });

    it('a child carrying its own ref prop keeps it when the slot has no ref', () => {
      const childRef = createRef<HTMLButtonElement>();
      render(
        <Slot className="slot">
          <button type="button" ref={childRef}>
            hi
          </button>
        </Slot>,
      );
      expect<HTMLElement | null>(childRef.current).toBe(
        screen.getByRole('button'),
      );
    });

    it('swapping the slot ref releases the old ref and attaches the new one', () => {
      const first = trackedRef<HTMLElement>('first', 'callback');
      const second = trackedRef<HTMLElement>('second', 'callback');
      const { rerender } = render(
        <Slot ref={first.ref}>
          <button type="button">hi</button>
        </Slot>,
      );
      rerender(
        <Slot ref={second.ref}>
          <button type="button">hi</button>
        </Slot>,
      );
      expect(first.events).toEqual(['first:BUTTON', 'first:null']);
      expect(second.events).toEqual(['second:BUTTON']);
    });

    it('a Fragment child does not receive the ref', () => {
      const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
      const callback = mock((_node: HTMLElement | null) => {});
      const { container } = render(
        <Slot ref={callback}>
          <Fragment>
            <a href="/">target</a>
          </Fragment>
        </Slot>,
      );
      errorSpy.mockRestore();
      expect(callback).not.toHaveBeenCalled();
      expect(container.innerHTML).toBe('<a href="/">target</a>');
    });
  });

  describe(`${name}: Button and Badge asChild`, () => {
    const Button = makeButton(Slot);
    const Badge = makeBadge(Slot);

    it('Button asChild renders <a href> with merged classes', () => {
      const { container } = render(
        <Button asChild className="from-button" variant="ghost">
          <a className="from-link" href="/docs">
            Docs
          </a>
        </Button>,
      );
      expect(container.innerHTML).toBe(
        '<a class="inline-flex gap-2 bg-transparent from-button from-link" href="/docs">Docs</a>',
      );
    });

    it('Button asChild fires both click handlers, link first then button', () => {
      const order: string[] = [];
      render(
        <Button asChild onClick={() => order.push('button')}>
          <a href="/docs" onClick={() => order.push('link')}>
            Docs
          </a>
        </Button>,
      );
      fireEvent.click(screen.getByRole('link'));
      expect(order).toEqual(['link', 'button']);
    });

    it('Button asChild forwards the ref to the anchor', () => {
      const ref = createRef<HTMLButtonElement>();
      render(
        <Button asChild ref={ref}>
          <a href="/docs">Docs</a>
        </Button>,
      );
      expect<HTMLElement | null>(ref.current).toBe(screen.getByRole('link'));
    });

    it('a forwardRef Button (the shape src uses) hands its ref to the anchor', () => {
      const ForwardRefButton = makeForwardRefButton(Slot);
      const ref = createRef<HTMLButtonElement>();
      render(
        <ForwardRefButton asChild ref={ref} className="x">
          <a className="y" href="/docs">
            Docs
          </a>
        </ForwardRefButton>,
      );
      const anchor = screen.getByRole('link');
      expect<HTMLElement | null>(ref.current).toBe(anchor);
      expect(anchor.getAttribute('class')).toBe('inline-flex gap-2 x y');
    });

    it('Badge asChild renders the child with merged classes and props', () => {
      const { container } = render(
        <Badge asChild className="extra" data-kind="status">
          <a className="mine" href="/s">
            Live
          </a>
        </Badge>,
      );
      expect(container.innerHTML).toBe(
        '<a class="badge extra mine" href="/s" data-kind="status">Live</a>',
      );
    });
  });

  describe(`${name}: non-element children`, () => {
    let errorSpy: ReturnType<typeof spyOn>;
    beforeEach(() => {
      errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      errorSpy.mockRestore();
    });

    it('the number 0 throws', () => {
      expect(() => render(<Slot>{0}</Slot>)).toThrow(/failed to slot/i);
    });

    it('an empty string renders nothing', () => {
      const { container } = render(<Slot>{''}</Slot>);
      expect(container.innerHTML).toBe('');
    });

    it('an array holding one element throws', () => {
      expect(() =>
        render(
          <Slot>
            {[
              <a key="one" href="/">
                one
              </a>,
            ]}
          </Slot>,
        ),
      ).toThrow(/failed to slot/i);
    });

    it('a number throws', () => {
      expect(() => render(<Slot>{5}</Slot>)).toThrow(/failed to slot/i);
    });
  });
}

describe('server rendering', () => {
  const [radix, lib] = implementations;
  const trees = [
    [
      'Button asChild link',
      (Slot: SlotComponent) => {
        const Button = makeButton(Slot);
        return (
          <Button asChild className="c" variant="ghost" loading>
            <a className="l" href="/docs" onClick={() => {}}>
              Docs
            </a>
          </Button>
        );
      },
    ],
    [
      'Badge asChild',
      (Slot: SlotComponent) => {
        const Badge = makeBadge(Slot);
        return (
          <Badge asChild className="c" data-x="1" style={{ color: 'red' }}>
            <a href="/s" style={{ color: 'blue', width: '1px' }}>
              Live
            </a>
          </Badge>
        );
      },
    ],
    [
      'described-by merge',
      (Slot: SlotComponent) => (
        <Slot aria-describedby="a b" className="s" id="slot-id">
          <button aria-describedby="b c" className="k" type="button">
            go
          </button>
        </Slot>
      ),
    ],
  ] as const;

  for (const [label, build] of trees) {
    it(`renderToStaticMarkup is identical for both slots: ${label}`, () => {
      if (!radix || !lib) throw new Error('implementations missing');
      const expected = renderToStaticMarkup(build(radix.Slot));
      const actual = renderToStaticMarkup(build(lib.Slot));
      expect(actual).toBe(expected);
      expect(actual.length).toBeGreaterThan(10);
    });
  }
});
