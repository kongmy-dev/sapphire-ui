import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';
import * as RadixSlot from '@radix-ui/react-slot';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ComponentProps, lazy, type ReactNode, Suspense } from 'react';
import { createFlightLazy } from './flight.js';

type IconButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

function SlottableButton({
  children,
  asChild = false,
  iconLeft,
  iconRight,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? RadixSlot.Slot : 'button';
  return (
    <Comp {...props}>
      {iconLeft}
      <RadixSlot.Slottable>{children}</RadixSlot.Slottable>
      {iconRight}
    </Comp>
  );
}

function NestedSlottableButton({
  children,
  asChild = false,
  iconLeft,
  iconRight,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? RadixSlot.Slot : 'button';
  return (
    <Comp {...props}>
      {iconLeft}
      <RadixSlot.Slottable child={children}>
        {(slottable) => <span>{slottable}</span>}
      </RadixSlot.Slottable>
      {iconRight}
    </Comp>
  );
}

const left = <span>left</span>;
const right = <span>right</span>;

describe('radix Slottable (not implemented by lib/slot)', () => {
  describe('given a Button with Slottable', () => {
    it('without asChild: renders a button with icon on the left/right', () => {
      const { container } = render(
        <SlottableButton iconLeft={left} iconRight={right}>
          Button <em>text</em>
        </SlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<button><span>left</span>Button <em>text</em><span>right</span></button>',
      );
    });

    it('with asChild: renders a link with icon on the left/right', () => {
      const { container } = render(
        <SlottableButton iconLeft={left} iconRight={right} asChild>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </SlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<a href="/docs"><span>left</span>Button <em>text</em><span>right</span></a>',
      );
    });
  });

  describe('given a Button with Slottable nesting', () => {
    it('without asChild: renders a button with a span around its children', () => {
      const { container } = render(
        <NestedSlottableButton>
          Button <em>text</em>
        </NestedSlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<button><span>Button <em>text</em></span></button>',
      );
    });

    it('without asChild: renders icons and a span around its children', () => {
      const { container } = render(
        <NestedSlottableButton iconLeft={left} iconRight={right}>
          Button <em>text</em>
        </NestedSlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<button><span>left</span><span>Button <em>text</em></span><span>right</span></button>',
      );
    });

    it('with asChild: renders a link with a span around its children', () => {
      const { container } = render(
        <NestedSlottableButton asChild>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </NestedSlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<a href="/docs"><span>Button <em>text</em></span></a>',
      );
    });

    it('with asChild: renders icons and a span around its children', () => {
      const { container } = render(
        <NestedSlottableButton asChild iconLeft={left} iconRight={right}>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </NestedSlottableButton>,
      );
      expect(container.innerHTML).toBe(
        '<a href="/docs"><span>left</span><span>Button <em>text</em></span><span>right</span></a>',
      );
    });
  });

  describe('given a Slot with React lazy components', () => {
    const LazyLink = lazy(() =>
      Promise.resolve({
        default: ({ children, ...props }: ComponentProps<'a'>) => (
          <a {...props}>{children}</a>
        ),
      }),
    );

    it('with a lazy component in Button with Slottable: renders a lazy link with icons', async () => {
      const { container } = render(
        <Suspense fallback={<div>Loading...</div>}>
          <SlottableButton iconLeft={left} iconRight={right} asChild>
            <LazyLink href="/docs">
              Button <em>text</em>
            </LazyLink>
          </SlottableButton>
        </Suspense>,
      );
      await screen.findByRole('link');
      expect(container.innerHTML).toBe(
        '<a href="/docs"><span>left</span>Button <em>text</em><span>right</span></a>',
      );
    });
  });

  describe('Slottable with a Flight lazy reference', () => {
    it('should unwrap a nested lazy reference reached through Slottable', async () => {
      const innerLazy = createFlightLazy(() => <a href="/inner">inner link</a>);
      const outerLazy = createFlightLazy(() => Promise.resolve(innerLazy));
      await act(async () => {
        render(
          <Suspense fallback={<div>loading</div>}>
            <RadixSlot.Slot className="slot">
              <RadixSlot.Slottable child={outerLazy}>
                {(slottable) => slottable}
              </RadixSlot.Slottable>
            </RadixSlot.Slot>
          </Suspense>,
        );
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      const link = screen.getByRole('link');
      expect(link.getAttribute('href')).toBe('/inner');
      expect(link.getAttribute('class')).toBe('slot');
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

    it('throws a Slottable error when a Slottable wraps multiple elements', () => {
      expect(() =>
        render(
          <RadixSlot.Slot className="x">
            <RadixSlot.Slottable>
              <a href="/">a</a>
              <b>b</b>
            </RadixSlot.Slottable>
          </RadixSlot.Slot>,
        ),
      ).toThrow(/Slottable.*single React element/i);
    });

    it('throws a Slottable error when a render-prop Slottable child is not an element', () => {
      expect(() =>
        render(
          <RadixSlot.Slot className="x">
            <RadixSlot.Slottable child="plain text">
              {(slottable) => <span>{slottable}</span>}
            </RadixSlot.Slottable>
          </RadixSlot.Slot>,
        ),
      ).toThrow(/Slottable.*single React element/i);
    });

    it('throws a Slottable error when a Slottable wraps a non-element child', () => {
      expect(() =>
        render(
          <RadixSlot.Slot className="x">
            <RadixSlot.Slottable>just text</RadixSlot.Slottable>
          </RadixSlot.Slot>,
        ),
      ).toThrow(/Slottable.*single React element/i);
    });
  });

  describe('Slottable identifier interoperability (Symbol.for)', () => {
    it('recognizes a foreign Slottable marked with the shared symbol', () => {
      const ForeignSlottable = Object.assign(
        (props: { children?: ReactNode }) => props.children,
        { __radixId: Symbol.for('radix.slottable') },
      );
      const { container } = render(
        <RadixSlot.Slot className="slot-class">
          <span data-icon>icon</span>
          <ForeignSlottable>
            <a href="/">target</a>
          </ForeignSlottable>
        </RadixSlot.Slot>,
      );
      const link = container.querySelector('a');
      expect(link).not.toBeNull();
      expect(link?.getAttribute('class')).toBe('slot-class');
      expect(link?.querySelector('[data-icon]')).not.toBeNull();
      expect(link?.textContent).toBe('icontarget');
    });
  });

  describe('Slottable (siblings) merges Slot props onto the slotted element', () => {
    it('merges className/handlers onto the slotted element while keeping siblings', () => {
      const handleClick = mock(() => {});
      render(
        <RadixSlot.Slot className="slot" onClick={handleClick}>
          <span data-icon-left>left</span>
          <RadixSlot.Slottable>
            <a className="child" href="/">
              target
            </a>
          </RadixSlot.Slottable>
          <span data-icon-right>right</span>
        </RadixSlot.Slot>,
      );
      const link = screen.getByRole('link');
      expect(link.getAttribute('class')).toBe('slot child');
      expect(link.querySelector('[data-icon-left]')).not.toBeNull();
      expect(link.querySelector('[data-icon-right]')).not.toBeNull();
      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('nested (render-prop) Slottable', () => {
    it('merges Slot props onto the rendered child and wraps the original children', () => {
      const handleClick = mock(() => {});
      render(
        <RadixSlot.Slot className="slot" onClick={handleClick}>
          <RadixSlot.Slottable child={<a href="/">target</a>}>
            {(slottable) => <span data-wrapper>{slottable}</span>}
          </RadixSlot.Slottable>
        </RadixSlot.Slot>,
      );
      const link = screen.getByRole('link');
      expect(link.getAttribute('class')).toBe('slot');
      const wrapper = link.querySelector('[data-wrapper]');
      expect(wrapper).not.toBeNull();
      expect(wrapper?.textContent).toBe('target');
      fireEvent.click(link);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('works under Suspense when the child element is lazy', async () => {
      const LazyLink = lazy(() =>
        Promise.resolve({
          default: ({ children, ...props }: ComponentProps<'a'>) => (
            <a {...props}>{children}</a>
          ),
        }),
      );
      render(
        <Suspense fallback={<div>loading</div>}>
          <RadixSlot.Slot className="slot">
            <RadixSlot.Slottable child={<LazyLink href="/">target</LazyLink>}>
              {(slottable) => <span data-wrapper>{slottable}</span>}
            </RadixSlot.Slottable>
          </RadixSlot.Slot>
        </Suspense>,
      );
      const link = await screen.findByRole('link');
      expect(link.getAttribute('class')).toBe('slot');
      expect(link.querySelector('[data-wrapper]')).not.toBeNull();
    });
  });
});
