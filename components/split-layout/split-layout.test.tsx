import { afterEach, beforeEach, expect, it, mock } from 'bun:test';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createRef } from 'react';
import type {
  GroupImperativeHandle,
  PanelImperativeHandle,
} from 'react-resizable-panels';
import { examples } from './split-layout.examples.js';
import { SplitHandle, SplitLayout, SplitPanel } from './split-layout.js';

const width = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetWidth',
);
const height = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetHeight',
);
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get: () => 500,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => 400,
  });
});
afterEach(() => {
  if (width) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', width);
  if (height)
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', height);
});

it('preserves native and imperative refs, layout callbacks and panel constraints', async () => {
  const group = createRef<GroupImperativeHandle>();
  const panel = createRef<PanelImperativeHandle>();
  const groupElement = createRef<HTMLDivElement>();
  const panelElement = createRef<HTMLDivElement>();
  const handle = createRef<HTMLDivElement>();
  const change = mock();
  render(
    <SplitLayout
      groupRef={group}
      elementRef={groupElement}
      className="custom"
      defaultLayout={{ first: 40, second: 60 }}
      onLayoutChange={change}
      id="workspace"
    >
      <SplitPanel
        id="first"
        elementRef={panelElement}
        panelRef={panel}
        minSize="20%"
        maxSize="80%"
        collapsible
        collapsedSize="0%"
      >
        First
      </SplitPanel>
      <SplitHandle ref={handle} aria-label="Resize panels" />
      <SplitPanel id="second">Second</SplitPanel>
    </SplitLayout>,
  );
  await waitFor(() =>
    expect(group.current?.getLayout()).toEqual({ first: 40, second: 60 }),
  );
  expect(groupElement.current?.className).toBe('sp-split-layout custom');
  expect(
    panelElement.current?.querySelector('.sp-split-layout-panel'),
  ).not.toBeNull();
  expect(handle.current?.className).toBe('sp-split-layout-handle');
  expect(handle.current?.getAttribute('role')).toBe('separator');
  await act(async () => group.current?.setLayout({ first: 60, second: 40 }));
  await waitFor(() =>
    expect(group.current?.getLayout()).toEqual({ first: 60, second: 40 }),
  );
  await act(async () => panel.current?.collapse());
  expect(panel.current?.isCollapsed()).toBe(true);
  await act(async () => panel.current?.expand());
  expect(panel.current?.isCollapsed()).toBe(false);
  await act(async () => panel.current?.resize('50%'));
  expect(panel.current?.getSize().asPercentage).toBe(50);
  expect(change).toHaveBeenCalled();
});

it('preserves elementRef precedence and disabled separator keyboard behavior', async () => {
  const ref = createRef<HTMLDivElement>();
  const elementRef = createRef<HTMLDivElement>();
  render(
    <SplitLayout disabled>
      <SplitPanel>First</SplitPanel>
      <SplitHandle
        ref={ref}
        elementRef={elementRef}
        disabled
        withHandle
        aria-label="Disabled resize"
      />
      <SplitPanel>Second</SplitPanel>
    </SplitLayout>,
  );
  expect(ref.current).toBeNull();
  expect(elementRef.current).not.toBeNull();
  expect(elementRef.current?.getAttribute('tabindex')).toBeNull();
  fireEvent.keyDown(elementRef.current ?? document.body, { key: 'ArrowRight' });
});

for (const { name, render: Example } of examples)
  it(`renders ${name} panel names and keyboard resize handle`, async () => {
    render(<Example />);
    const handle = screen.getByRole('separator');
    expect(handle.getAttribute('aria-label')).toBe(
      name === 'workspace' ? 'Resize navigation' : 'Resize preview',
    );
    expect(handle.getAttribute('aria-orientation')).toBe(
      name === 'workspace' ? 'vertical' : 'horizontal',
    );
    act(() => handle.focus());
    expect(document.activeElement).toBe(handle);
  });

it('keeps scrollable panel content keyboard reachable and preserves callback ref cleanup', () => {
  const cleanup = mock();
  const elementRef = mock((node: HTMLDivElement | null) =>
    node ? cleanup : undefined,
  );
  const view = render(
    <SplitLayout>
      <SplitPanel elementRef={elementRef}>Scrollable text</SplitPanel>
    </SplitLayout>,
  );
  const content = screen.getByText('Scrollable text');
  expect(content.tabIndex).toBe(0);
  act(() => content.focus());
  expect(document.activeElement).toBe(content);
  view.unmount();
  expect(cleanup).toHaveBeenCalled();
});

it('honors panel tab order and clears callback refs without cleanup returns', () => {
  const elementRef = mock((_node: HTMLDivElement | null) => undefined);
  const view = render(
    <SplitLayout>
      <SplitPanel elementRef={elementRef} tabIndex={-1}>
        Programmatic panel
      </SplitPanel>
    </SplitLayout>,
  );
  expect(screen.getByText('Programmatic panel').tabIndex).toBe(-1);
  expect(
    screen
      .getByText('Programmatic panel')
      .parentElement?.hasAttribute('tabindex'),
  ).toBe(false);
  view.rerender(
    <SplitLayout>
      <SplitPanel elementRef={elementRef} tabIndex={0}>
        Programmatic panel
      </SplitPanel>
    </SplitLayout>,
  );
  expect(screen.getByText('Programmatic panel').tabIndex).toBe(0);
  expect(
    screen
      .getByText('Programmatic panel')
      .parentElement?.hasAttribute('tabindex'),
  ).toBe(false);
  view.unmount();
  expect(elementRef).toHaveBeenLastCalledWith(null);
});
