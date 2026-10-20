import { afterEach, expect, test } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import { useCopyToClipboard } from './use-copy-to-clipboard.js';

const descriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
afterEach(() => {
  if (descriptor === undefined) Reflect.deleteProperty(navigator, 'clipboard');
  else Object.defineProperty(navigator, 'clipboard', descriptor);
});
const clipboard = (writeText: (text: string) => Promise<void>) =>
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
const deferred = () => {
  let resolve = () => {};
  let reject = (_error: Error) => {};
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};

test('copies text and resets feedback after the configured duration', async () => {
  const writes: string[] = [];
  clipboard(async (text) => {
    writes.push(text);
  });
  const hook = renderHook(() => useCopyToClipboard({ resetMs: 10 }));
  let success = false;
  await act(async () => {
    success = await hook.result.current.copy('hello');
  });
  expect(success).toBe(true);
  expect(writes).toEqual(['hello']);
  expect(hook.result.current.copied).toBe('hello');
  expect(hook.result.current.isCopied).toBe(true);
  await act(() => Bun.sleep(20));
  expect(hook.result.current.isCopied).toBe(false);
});

test('resets the previous timer when a later copy succeeds', async () => {
  clipboard(async () => {});
  const hook = renderHook(() => useCopyToClipboard({ resetMs: 40 }));
  await act(() => hook.result.current.copy('first'));
  await act(() => Bun.sleep(25));
  await act(() => hook.result.current.copy('second'));
  await act(() => Bun.sleep(25));
  expect(hook.result.current.copied).toBe('second');
  await act(() => Bun.sleep(25));
  expect(hook.result.current.copied).toBeNull();
});

test('latest invocation owns feedback when clipboard promises finish out of order', async () => {
  const first = deferred();
  const second = deferred();
  clipboard((text) => (text === 'first' ? first.promise : second.promise));
  const hook = renderHook(() => useCopyToClipboard());
  const old = hook.result.current.copy('first');
  const latest = hook.result.current.copy('second');
  await act(async () => {
    second.resolve();
    expect(await latest).toBe(true);
  });
  await act(async () => {
    first.resolve();
    expect(await old).toBe(true);
  });
  expect(hook.result.current.copied).toBe('second');
});

test('rejects unsupported or denied clipboard access without claiming success', async () => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: undefined,
  });
  const hook = renderHook(() => useCopyToClipboard());
  expect(await hook.result.current.copy('unsupported')).toBe(false);
  clipboard(async () => {
    throw new Error('Denied');
  });
  expect(await hook.result.current.copy('denied')).toBe(false);
  expect(hook.result.current.copied).toBeNull();
});

test('a failed newer request never resurrects stale pending feedback', async () => {
  const first = deferred();
  clipboard((text) =>
    text === 'first' ? first.promise : Promise.reject(new Error('Denied')),
  );
  const hook = renderHook(() => useCopyToClipboard());
  const old = hook.result.current.copy('first');
  expect(await hook.result.current.copy('second')).toBe(false);
  await act(async () => {
    first.resolve();
    await old;
  });
  expect(hook.result.current.copied).toBeNull();
});

test('unmount cancels reset timers and ignores outstanding clipboard completions', async () => {
  const pending = deferred();
  clipboard(() => pending.promise);
  const hook = renderHook(() => useCopyToClipboard({ resetMs: 10 }));
  const request = hook.result.current.copy('late');
  hook.unmount();
  await act(async () => {
    pending.resolve();
    expect(await request).toBe(true);
  });
  expect(hook.result.current.copied).toBeNull();
  clipboard(async () => {});
  const completed = renderHook(() => useCopyToClipboard({ resetMs: 10 }));
  await act(() => completed.result.current.copy('done'));
  completed.unmount();
  await act(() => Bun.sleep(20));
  expect(completed.result.current.copied).toBe('done');
});
