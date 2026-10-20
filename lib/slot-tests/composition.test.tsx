import { describe, expect, it, mock } from 'bun:test';
import { fireEvent, render, screen } from '@testing-library/react';
import { lazy, Suspense } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  expectedHtml,
  makeIconButton,
  makeNavItem,
  NavItemWithSlottable,
} from './fixtures.js';
import { implementations } from './impls.js';

const left = <span>left</span>;
const right = <span>right</span>;

for (const { name, Slot } of implementations) {
  describe(`${name}: Slottable cases rebuilt by cloning the child`, () => {
    const IconButton = makeIconButton(Slot, false);
    const WrappedIconButton = makeIconButton(Slot, true);

    it('button with icons', () => {
      const { container } = render(
        <IconButton iconLeft={left} iconRight={right}>
          Button <em>text</em>
        </IconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.iconButton);
    });

    it('link with icons', () => {
      const { container } = render(
        <IconButton iconLeft={left} iconRight={right} asChild>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </IconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.iconLink);
    });

    it('nested: button with a span around its children', () => {
      const { container } = render(
        <WrappedIconButton>
          Button <em>text</em>
        </WrappedIconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.wrappedButton);
    });

    it('nested: button with icons and a span around its children', () => {
      const { container } = render(
        <WrappedIconButton iconLeft={left} iconRight={right}>
          Button <em>text</em>
        </WrappedIconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.wrappedIconButton);
    });

    it('nested: link with a span around its children', () => {
      const { container } = render(
        <WrappedIconButton asChild>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </WrappedIconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.wrappedLink);
    });

    it('nested: link with icons and a span around its children', () => {
      const { container } = render(
        <WrappedIconButton asChild iconLeft={left} iconRight={right}>
          <a href="/docs">
            Button <em>text</em>
          </a>
        </WrappedIconButton>,
      );
      expect(container.innerHTML).toBe(expectedHtml.wrappedIconLink);
    });

    it('lazy link with icons', async () => {
      const LazyLink = lazy(() =>
        Promise.resolve({
          default: ({ children, ...props }: React.ComponentProps<'a'>) => (
            <a {...props}>{children}</a>
          ),
        }),
      );
      const { container } = render(
        <Suspense fallback={<div>Loading...</div>}>
          <IconButton iconLeft={left} iconRight={right} asChild>
            <LazyLink href="/docs">
              Button <em>text</em>
            </LazyLink>
          </IconButton>
        </Suspense>,
      );
      await screen.findByRole('link');
      expect(container.innerHTML).toBe(expectedHtml.iconLink);
    });
  });
}

type NavCase = {
  readonly label: string;
  readonly icon?: string;
  readonly active?: boolean;
  readonly badge?: string;
  readonly collapsed?: boolean;
  readonly className?: string;
};

const navCases: readonly NavCase[] = [
  { label: 'plain' },
  { label: 'icon', icon: 'home' },
  { label: 'icon active', icon: 'home', active: true },
  { label: 'icon badge', icon: 'home', badge: '3' },
  { label: 'badge only', badge: '12' },
  {
    label: 'collapsed with icon and badge',
    icon: 'home',
    badge: '3',
    collapsed: true,
  },
  { label: 'extra class', icon: 'home', className: 'extra' },
  {
    label: 'everything',
    icon: 'home',
    active: true,
    badge: '9',
    className: 'x y',
  },
];

for (const { name, Slot } of implementations) {
  describe(`${name}: sidebar link (asChild branch) without Slottable matches the Slottable version`, () => {
    const NavItem = makeNavItem(Slot);

    for (const navCase of navCases) {
      const { label, ...navProps } = navCase;
      it(`static markup is identical: ${label}`, () => {
        const expected = renderToStaticMarkup(
          <NavItemWithSlottable asChild {...navProps} data-testid="nav">
            <a className="child" href="/x">
              Dashboard
            </a>
          </NavItemWithSlottable>,
        );
        const actual = renderToStaticMarkup(
          <NavItem asChild {...navProps} data-testid="nav">
            <a className="child" href="/x">
              Dashboard
            </a>
          </NavItem>,
        );
        expect(actual).toBe(expected);
        expect(actual).toContain('Dashboard');
      });
    }

    it('click handlers run child first, then link; ref receives the anchor', () => {
      const order: string[] = [];
      const ref = mock((_node: HTMLAnchorElement | null) => {});
      render(
        <NavItem
          asChild
          icon="home"
          ref={ref}
          onClick={() => order.push('link')}
        >
          <a href="/x" onClick={() => order.push('child')}>
            Dashboard
          </a>
        </NavItem>,
      );
      const anchor = screen.getByRole('link');
      fireEvent.click(anchor);
      expect(order).toEqual(['child', 'link']);
      expect(ref).toHaveBeenCalledWith(anchor);
    });
  });
}
