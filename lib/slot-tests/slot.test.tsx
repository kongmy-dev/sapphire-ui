import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  type ComponentProps,
  type ElementType,
  forwardRef,
  lazy,
  type ReactNode,
  Suspense,
  useCallback,
  useReducer,
  useRef,
} from 'react';
import { createFlightLazy } from './flight.js';
import { implementations } from './impls.js';

type TriggerProps = ComponentProps<'button'> & { as?: ElementType };

const Trigger = ({ as: Comp = 'button', ...props }: TriggerProps) => (
  <Comp {...props} />
);

for (const { name, Slot } of implementations) {
  describe(`${name}: with onClick on itself`, () => {
    const handleClick = mock(() => {});
    beforeEach(() => {
      handleClick.mockReset();
      render(
        <Trigger as={Slot} onClick={handleClick}>
          <button type="button">Click me</button>
        </Trigger>,
      );
      fireEvent.click(screen.getByRole('button'));
    });

    it('should call the onClick passed to the Trigger', () => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on the child', () => {
    const handleClick = mock(() => {});
    beforeEach(() => {
      handleClick.mockReset();
      render(
        <Trigger as={Slot}>
          <button type="button" onClick={handleClick}>
            Click me
          </button>
        </Trigger>,
      );
      fireEvent.click(screen.getByRole('button'));
    });

    it("should call the child's onClick", () => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on itself AND the child', () => {
    const handleTriggerClick = mock(() => {});
    const handleChildClick = mock(() => {});
    beforeEach(() => {
      handleTriggerClick.mockReset();
      handleChildClick.mockReset();
      render(
        <Trigger as={Slot} onClick={handleTriggerClick}>
          <button type="button" onClick={handleChildClick}>
            Click me
          </button>
        </Trigger>,
      );
      fireEvent.click(screen.getByRole('button'));
    });

    it("should call the Trigger's onClick", () => {
      expect(handleTriggerClick).toHaveBeenCalledTimes(1);
    });

    it("should call the child's onClick", () => {
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with onClick on itself AND undefined onClick on the child', () => {
    const handleTriggerClick = mock(() => {});
    beforeEach(() => {
      handleTriggerClick.mockReset();
      render(
        <Trigger as={Slot} onClick={handleTriggerClick}>
          <button type="button" onClick={undefined}>
            Click me
          </button>
        </Trigger>,
      );
      fireEvent.click(screen.getByRole('button'));
    });

    it("should call the Trigger's onClick", () => {
      expect(handleTriggerClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('with undefined onClick on itself AND onClick on the child', () => {
    const handleChildClick = mock(() => {});
    beforeEach(() => {
      handleChildClick.mockReset();
      render(
        <Trigger as={Slot} onClick={undefined}>
          <button type="button" onClick={handleChildClick}>
            Click me
          </button>
        </Trigger>,
      );
      fireEvent.click(screen.getByRole('button'));
    });

    it("should call the child's onClick", () => {
      expect(handleChildClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('given a Slot with React lazy components', () => {
    describe('with a lazy component as child', () => {
      const LazyButton = lazy(() =>
        Promise.resolve({
          default: ({ children, ...props }: ComponentProps<'button'>) => (
            <button {...props}>{children}</button>
          ),
        }),
      );

      it('should render the lazy component correctly', async () => {
        const handleClick = mock(() => {});
        render(
          <Suspense fallback={<div>Loading...</div>}>
            <Slot onClick={handleClick}>
              <LazyButton>Click me</LazyButton>
            </Slot>
          </Suspense>,
        );
        await screen.findByRole('button');
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('given a Slot with React Flight lazy references', () => {
    it('should unwrap a lazy reference that resolves to an element', async () => {
      const lazyLink = createFlightLazy(() => (
        <a href="/single">single link</a>
      ));
      await act(async () => {
        render(
          <Suspense fallback={<div>loading</div>}>
            <Slot className="slot">{lazyLink}</Slot>
          </Suspense>,
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/single');
      expect(link.getAttribute('class')).toBe('slot');
      expect(link.textContent).toBe('single link');
    });

    it('should unwrap a lazy reference that resolves to another lazy reference', async () => {
      const innerLazy = createFlightLazy(() => <a href="/inner">inner link</a>);
      const outerLazy = createFlightLazy(() => Promise.resolve(innerLazy));
      await act(async () => {
        render(
          <Suspense fallback={<div>loading</div>}>
            <Slot className="slot">{outerLazy}</Slot>
          </Suspense>,
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/inner');
      expect(link.getAttribute('class')).toBe('slot');
      expect(link.textContent).toBe('inner link');
    });
  });

  describe('Slot prop and ref merging (single element child)', () => {
    it('merges className, forwards unknown props, and composes onClick (child first, then slot)', () => {
      const order: string[] = [];
      render(
        <Slot
          className="slot"
          data-from-slot="yes"
          data-only-slot="1"
          onClick={() => order.push('slot')}
        >
          <button
            className="child"
            data-from-child="yes"
            onClick={() => order.push('child')}
            type="button"
          >
            hi
          </button>
        </Slot>,
      );
      const button = screen.getByRole('button');
      expect(button.getAttribute('class')).toBe('slot child');
      expect(button.getAttribute('data-from-slot')).toBe('yes');
      expect(button.getAttribute('data-from-child')).toBe('yes');
      expect(button.getAttribute('data-only-slot')).toBe('1');
      fireEvent.click(button);
      expect(order).toEqual(['child', 'slot']);
    });

    it('merges, normalizes, and deduplicates aria-describedby with the child ids first', () => {
      render(
        <Slot aria-describedby={' shared-description  slot-description '}>
          <button
            aria-describedby={
              ' child-description\tshared-description child-description '
            }
            type="button"
          >
            hi
          </button>
        </Slot>,
      );
      expect(screen.getByRole('button').getAttribute('aria-describedby')).toBe(
        'child-description shared-description slot-description',
      );
    });

    it('composes the Slot ref and the child ref onto the same node', () => {
      const slotRef = mock((_node: HTMLElement | null) => {});
      const childRef = mock((_node: HTMLButtonElement | null) => {});
      render(
        <Slot ref={slotRef}>
          <button ref={childRef} type="button">
            hi
          </button>
        </Slot>,
      );
      const button = screen.getByRole('button');
      expect(slotRef).toHaveBeenCalledWith(button);
      expect(childRef).toHaveBeenCalledWith(button);
    });
  });

  describe('Slot with non-mergeable children', () => {
    let errorSpy: ReturnType<typeof spyOn>;
    beforeEach(() => {
      errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => {
      errorSpy.mockRestore();
    });

    const emptyChildren: readonly [string, ReactNode][] = [
      ['null', null],
      ['undefined', undefined],
      ['false (e.g. a falsy `&&` expression)', false],
    ];
    for (const [label, children] of emptyChildren) {
      it(`renders nothing and does not throw for ${label} children`, () => {
        const { container } = render(<Slot className="x">{children}</Slot>);
        expect(container.innerHTML).toBe('');
      });
    }

    it('renders an empty Slot without throwing', () => {
      const { container } = render(<Slot className="x" />);
      expect(container.innerHTML).toBe('');
    });

    it('throws a descriptive error when given multiple element children', () => {
      expect(() =>
        render(
          <Slot className="x" data-from-slot="yes">
            <button type="button">one</button>
            <button type="button">two</button>
          </Slot>,
        ),
      ).toThrow(/failed to slot onto its children/i);
    });

    it('throws a descriptive error for a single non-element child', () => {
      expect(() => render(<Slot className="x">hello</Slot>)).toThrow(
        /failed to slot onto its children/i,
      );
    });
  });

  it('does not cause an infinite render loop when attaching the ref triggers a render', () => {
    let renderCount = 0;
    function App() {
      renderCount++;
      const [, forceRender] = useReducer((count: number) => count + 1, 0);
      const ref = useCallback((node: HTMLElement | null) => {
        if (node) forceRender();
      }, []);
      return (
        <Slot ref={ref}>
          <button type="button">Click me</button>
        </Slot>
      );
    }
    expect(() => render(<App />)).not.toThrow();
    expect(renderCount).toBeLessThan(25);
  });

  it('passes a single stable composed ref to the child across re-renders', () => {
    const refIdentities = new Set<unknown>();
    let bump: () => void = () => {};
    const Child = forwardRef<HTMLButtonElement>(function Child(_props, ref) {
      refIdentities.add(ref);
      return <button type="button" ref={ref} />;
    });
    function App() {
      const [, forceRender] = useReducer((count: number) => count + 1, 0);
      bump = forceRender;
      const forwardedRef = useRef<HTMLButtonElement>(null);
      return (
        <Slot ref={forwardedRef}>
          <Child />
        </Slot>
      );
    }
    render(<App />);
    act(() => bump());
    act(() => bump());
    expect(refIdentities.size).toBe(1);
  });
}
