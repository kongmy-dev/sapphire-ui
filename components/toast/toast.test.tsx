import { expect, test } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, createRef, StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { examples } from './toast.examples.js';
import { Toast, type ToastRef } from './toast.js';

test('provides a persistent live region and escapes queued messages', async () => {
  const ref = createRef<ToastRef>();
  const view = render(<Toast ref={ref} />);
  const region = screen.getByRole('status');
  expect(region.getAttribute('aria-live')).toBe('polite');
  expect(region.parentElement).toBe(document.body);
  expect(view.container.querySelector('.sp-toast-viewport')).toBeNull();
  expect(region.textContent).toBe('');
  act(() => {
    ref.current?.show('<img src=x onerror=alert(1)>');
    ref.current?.show('Information', 'info', Number.NaN);
    ref.current?.show('Warning', 'warning', 1000);
    ref.current?.show('Error', 'error', 1000);
  });
  expect(region.querySelector('img')).toBeNull();
  expect(region.querySelectorAll('.sp-toast').length).toBe(4);
  expect(region.querySelectorAll('svg[aria-hidden="true"]').length).toBe(4);
  expect(region.textContent).toContain('<img src=x onerror=alert(1)>');
  await act(() => Bun.sleep(30));
  expect(region.querySelectorAll('[data-state="open"]').length).toBe(4);
  view.unmount();
});

test('closes then removes a notification without removing its siblings', async () => {
  const ref = createRef<ToastRef>();
  render(<Toast ref={ref} />);
  act(() => {
    ref.current?.show('Short', 'success', 50);
    ref.current?.show('Long', 'info', 1000);
  });
  await act(() => Bun.sleep(25));
  expect(
    screen.getByText('Short').parentElement?.getAttribute('data-state'),
  ).toBe('open');
  await act(() => Bun.sleep(50));
  expect(
    screen.getByText('Short').parentElement?.hasAttribute('data-state'),
  ).toBe(false);
  await act(() => Bun.sleep(400));
  expect(screen.queryByText('Short')).toBeNull();
  expect(screen.getByText('Long')).not.toBeNull();
});

test('zero duration never reopens and stale handles cannot enqueue after unmount', async () => {
  const ref = createRef<ToastRef>();
  const view = render(<Toast ref={ref} />);
  const handle = ref.current;
  act(() => handle?.show('Immediate', 'success', -1));
  await act(() => Bun.sleep(30));
  expect(
    screen.getByText('Immediate').parentElement?.hasAttribute('data-state'),
  ).toBe(false);
  view.unmount();
  act(() => handle?.show('After unmount'));
  expect(screen.queryByRole('status')).toBeNull();
});

test('can unmount before its animation frame and render on the server', () => {
  const ref = createRef<ToastRef>();
  const view = render(<Toast ref={ref} />);
  act(() => ref.current?.show('Pending'));
  view.unmount();
  expect(renderToString(<Toast />)).toContain('aria-live="polite"');
});

test('independent roots share a viewport and clean up only their own queue', () => {
  const first = createRef<ToastRef>();
  const second = createRef<ToastRef>();
  const firstRoot = render(
    <StrictMode>
      <Toast ref={first} />
    </StrictMode>,
  );
  const secondRoot = render(<Toast ref={second} />);
  act(() => {
    first.current?.show('First root');
    second.current?.show('Second root');
  });
  expect(screen.getAllByRole('status')).toHaveLength(1);
  const region = screen.getByRole('status');
  expect(region.textContent).toContain('First root');
  expect(region.textContent).toContain('Second root');
  firstRoot.unmount();
  expect(screen.queryByText('First root')).toBeNull();
  expect(screen.getByRole('status')).toBe(region);
  expect(region.textContent).toContain('Second root');
  act(() => second.current?.show('Still active'));
  expect(region.textContent).toContain('Still active');
  secondRoot.unmount();
  expect(screen.queryByRole('status')).toBeNull();
  const next = render(<Toast />);
  expect(screen.getByRole('status')).not.toBe(region);
  next.unmount();
});

for (const example of examples) {
  test(`example ${example.name} triggers its documented notifications`, () => {
    render(createElement(example.render));
    for (const button of screen.getAllByRole('button')) fireEvent.click(button);
    expect(
      screen.getByRole('status').querySelectorAll('.sp-toast').length,
    ).toBe(example.name === 'statuses' ? 4 : 1);
  });
}
