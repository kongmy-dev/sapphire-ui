import { expect, test } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { useFocusReturn } from './use-focus-return.js';

test('returns focus to a connected launcher and prevents default focus', () => {
  const button = document.createElement('button');
  document.body.append(button);
  button.focus();
  const { result } = renderHook(useFocusReturn);
  result.current.onOpenAutoFocus();
  button.blur();
  const event = new Event('close', { cancelable: true });
  result.current.onCloseAutoFocus(event);
  expect(document.activeElement).toBe(button);
  expect(event.defaultPrevented).toBe(true);
  button.remove();
});

test('allows default focus if no launcher is recorded or the launcher was removed', () => {
  const { result } = renderHook(useFocusReturn);
  const initial = new Event('close', { cancelable: true });
  result.current.onCloseAutoFocus(initial);
  expect(initial.defaultPrevented).toBe(false);
  const button = document.createElement('button');
  document.body.append(button);
  button.focus();
  result.current.onOpenAutoFocus();
  button.remove();
  const removed = new Event('close', { cancelable: true });
  result.current.onCloseAutoFocus(removed);
  expect(removed.defaultPrevented).toBe(false);
});
