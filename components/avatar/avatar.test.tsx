import { afterEach, expect, it } from 'bun:test';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { examples } from './avatar.examples.js';
import { Avatar } from './avatar.js';

const originalImage = window.Image;
afterEach(() => {
  Object.defineProperty(window, 'Image', {
    configurable: true,
    writable: true,
    value: originalImage,
  });
});

function images() {
  const pending: HTMLImageElement[] = [];
  function imageFixture() {
    const image = document.createElement('img');
    Object.defineProperty(image, 'complete', {
      configurable: true,
      value: false,
    });
    pending.push(image);
    return image;
  }
  Object.defineProperty(window, 'Image', {
    configurable: true,
    writable: true,
    value: imageFixture,
  });
  return pending;
}

function loaded(image: HTMLImageElement | undefined) {
  if (!image) throw new Error('Image request missing');
  Object.defineProperty(image, 'complete', { configurable: true, value: true });
  Object.defineProperty(image, 'naturalWidth', {
    configurable: true,
    value: 32,
  });
  fireEvent.load(image);
}

it('shows delayed fallback and preserves native root attributes and refs', async () => {
  const ref = createRef<HTMLSpanElement>();
  render(
    <Avatar
      ref={ref}
      className="custom"
      fallback="AB"
      size="lg"
      aria-label="Alex Brown"
    />,
  );
  expect(ref.current?.className).toBe('sp-avatar custom');
  expect(ref.current?.dataset.size).toBe('lg');
  expect(screen.queryByText('AB')).toBeNull();
  await screen.findByText('AB');
  expect<HTMLElement | null>(screen.getByLabelText('Alex Brown')).toBe(
    ref.current,
  );
});

it('loads an image, falls back on error, recovers when source changes and ignores stale image events', async () => {
  const pending = images();
  const { rerender, unmount } = render(
    <Avatar src="/first.png" alt="Portrait" fallback="AB" />,
  );
  loaded(pending[0]);
  await screen.findByRole('img', { name: 'Portrait' });
  expect(screen.queryByText('AB')).toBeNull();
  rerender(<Avatar src="/broken.png" alt="Portrait" fallback="AB" />);
  const broken = pending[1];
  if (!broken) throw new Error('Image request missing');
  fireEvent.error(broken);
  await screen.findByText('AB');
  expect(screen.queryByRole('img')).toBeNull();
  rerender(
    <Avatar src="/recovered.png" alt="Recovered portrait" fallback="AB" />,
  );
  loaded(pending[2]);
  await screen.findByRole('img', { name: 'Recovered portrait' });
  fireEvent.error(broken);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/recovered.png');
  unmount();
  fireEvent.error(pending[2] ?? broken);
  expect(screen.queryByRole('img')).toBeNull();
});

for (const { name, render: Example } of examples) {
  it(`renders and exercises ${name}`, async () => {
    const pending = images();
    const { container } = render(<Example />);
    expect(container.querySelector('.sp-avatar')).not.toBeNull();
    if (name === 'lifecycle') {
      loaded(pending[0]);
      await userEvent.click(
        screen.getByRole('button', { name: 'Break portrait' }),
      );
      const broken = pending[1];
      if (!broken) throw new Error('Image request missing');
      fireEvent.error(broken);
      await screen.findByText('AP');
      await userEvent.click(
        screen.getByRole('button', { name: 'Restore portrait' }),
      );
      loaded(pending[2]);
      await waitFor(() => expect(screen.getByRole('img')).not.toBeNull());
    }
  });
}
