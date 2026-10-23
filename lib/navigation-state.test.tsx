import { afterEach, expect, it, mock } from 'bun:test';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import {
  type NavigationStateOptions,
  useNavigationState,
} from './navigation-state.js';

const originalMedia = window.matchMedia;
afterEach(() => {
  window.matchMedia = originalMedia;
});

function Navigation(props: NavigationStateOptions) {
  const navigation = useNavigationState(props);
  return (
    <>
      <button type="button" onClick={navigation.toggleNavigation}>
        Toggle
      </button>
      <output aria-label="Desktop">{navigation.desktopState}</output>
      <output aria-label="Mobile">{String(navigation.mobileOpen)}</output>
      <output aria-label="Compact">{String(navigation.compact)}</output>
    </>
  );
}

function viewport(initial: boolean) {
  const media = originalMedia('(width < 48rem)');
  let mobile = initial;
  Object.defineProperty(media, 'matches', {
    configurable: true,
    get: () => mobile,
  });
  window.matchMedia = () => media;
  return (next: boolean) =>
    act(() => {
      mobile = next;
      media.dispatchEvent(new Event('change'));
    });
}

it('keeps uncontrolled changes with observer callbacks and independent owners', () => {
  const changed = mock();
  render(
    <>
      <Navigation onDesktopStateChange={changed} />
      <Navigation defaultDesktopState="compact" />
    </>,
  );
  const triggers = screen.getAllByRole('button');
  const first = triggers[0];
  const second = triggers[1];
  if (!first || !second) throw new Error('Missing navigation controls');
  fireEvent.click(first);
  expect(
    screen.getAllByLabelText('Desktop').map((node) => node.textContent),
  ).toEqual(['compact', 'compact']);
  expect(changed).toHaveBeenLastCalledWith('compact');
  fireEvent.click(first);
  expect(changed).toHaveBeenLastCalledWith('expanded');
  fireEvent.click(second);
  expect(
    screen.getAllByLabelText('Desktop').map((node) => node.textContent),
  ).toEqual(['expanded', 'expanded']);
});

it('uses supplied desktop values while requesting changes and accepts external updates', () => {
  const changed = mock();
  const view = render(
    <Navigation desktopState="expanded" onDesktopStateChange={changed} />,
  );
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenCalledWith('compact');
  expect(screen.getByLabelText('Desktop').textContent).toBe('expanded');
  view.rerender(<Navigation desktopState="compact" />);
  expect(screen.getByLabelText('Compact').textContent).toBe('true');
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByLabelText('Desktop').textContent).toBe('compact');
});

it('retains desktop preference and clears an uncontrolled drawer on desktop round trips', () => {
  const resize = viewport(true);
  const changed = mock();
  render(
    <Navigation defaultDesktopState="compact" onMobileOpenChange={changed} />,
  );
  expect(screen.getByLabelText('Compact').textContent).toBe('false');
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByLabelText('Mobile').textContent).toBe('true');
  expect(changed).toHaveBeenLastCalledWith(true);
  resize(false);
  expect(screen.getByLabelText('Mobile').textContent).toBe('false');
  expect(screen.getByLabelText('Compact').textContent).toBe('true');
  expect(changed).toHaveBeenLastCalledWith(false);
  resize(true);
  expect(screen.getByLabelText('Desktop').textContent).toBe('compact');
  expect(screen.getByLabelText('Mobile').textContent).toBe('false');
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByLabelText('Mobile').textContent).toBe('false');
});

it('uses controlled mobile values and requests closing at desktop entry', () => {
  const resize = viewport(true);
  const changed = mock();
  const view = render(<Navigation mobileOpen onMobileOpenChange={changed} />);
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenLastCalledWith(false);
  expect(screen.getByLabelText('Mobile').textContent).toBe('true');
  view.rerender(<Navigation mobileOpen={false} onMobileOpenChange={changed} />);
  fireEvent.click(screen.getByRole('button'));
  expect(changed).toHaveBeenLastCalledWith(true);
  view.rerender(<Navigation mobileOpen onMobileOpenChange={changed} />);
  resize(false);
  expect(changed).toHaveBeenLastCalledWith(false);
});

it('renders a closed server presentation and respects default mobile state in a mobile client', () => {
  expect(renderToString(<Navigation />)).toContain('expanded');
  viewport(true);
  render(<Navigation defaultMobileOpen />);
  expect(screen.getByLabelText('Mobile').textContent).toBe('true');
});
