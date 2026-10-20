import { afterEach, expect, it, mock } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { examples } from './banner.examples.js';
import { Banner, type BannerRef } from './banner.js';

const storage = Object.getOwnPropertyDescriptor(window, 'localStorage');
afterEach(() => {
  if (storage) Object.defineProperty(window, 'localStorage', storage);
  localStorage.clear();
});

it('dismisses without submitting forms, notifies and restores children imperatively', () => {
  const ref = createRef<BannerRef>();
  const dismiss = mock(() => {});
  const submit = mock(() => {});
  render(
    <form onSubmit={submit}>
      <Banner ref={ref} onDismiss={dismiss} className="custom">
        <a href="#details">Announcement</a>
      </Banner>
    </form>,
  );
  expect(screen.getByRole('link').parentElement?.className).toBe(
    'sp-banner custom',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(submit).not.toHaveBeenCalled();
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole('link')).toBeNull();
  act(() => ref.current?.show());
  expect(screen.getByRole('link')).not.toBeNull();
});

it('respects saved dismissals, changes storage keys and clears persistence when shown', () => {
  localStorage.setItem('sapphire-banner:old', '1');
  const ref = createRef<BannerRef>();
  expect(renderToString(<Banner storageKey="old">Notice</Banner>)).toContain(
    'Notice',
  );
  const { rerender, unmount } = render(
    <Banner ref={ref} storageKey="old">
      Notice
    </Banner>,
  );
  expect(screen.queryByRole('button')).toBeNull();
  rerender(
    <Banner ref={ref} storageKey="new">
      New notice
    </Banner>,
  );
  expect(screen.getByRole('button')).not.toBeNull();
  act(() => ref.current?.dismiss());
  expect(localStorage.getItem('sapphire-banner:new')).toBe('1');
  act(() => ref.current?.show());
  expect(localStorage.getItem('sapphire-banner:new')).toBeNull();
  unmount();
  render(<Banner storageKey="new">New notice</Banner>);
  expect(screen.getByRole('button')).not.toBeNull();
});

it('keeps in-memory behavior when storage is unavailable', () => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    get: () => {
      throw new Error('denied');
    },
  });
  const ref = createRef<BannerRef>();
  render(
    <Banner ref={ref} storageKey="private">
      Notice
    </Banner>,
  );
  fireEvent.click(screen.getByRole('button'));
  expect(screen.queryByRole('button')).toBeNull();
  act(() => ref.current?.show());
  expect(screen.getByRole('button')).not.toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, () => {
    render(<Example />);
    if (name === 'variants') expect(screen.queryByRole('button')).toBeNull();
    else {
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      fireEvent.click(
        screen.getByRole('button', { name: 'Show announcement' }),
      );
      expect(screen.getByRole('link')).not.toBeNull();
    }
  });
}
