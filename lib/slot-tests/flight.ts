import type { ReactNode } from 'react';

const lazyReferenceType = Symbol.for('react.lazy');

function isFlightNode(value: unknown): value is ReactNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$$typeof' in value &&
    value.$$typeof === lazyReferenceType &&
    '_init' in value &&
    typeof value._init === 'function' &&
    '_payload' in value &&
    value._payload instanceof Promise
  );
}

export function createFlightLazy<T>(resolve: () => Promise<T> | T): ReactNode {
  let state: 'pending' | 'fulfilled' | 'rejected' = 'pending';
  let value: T | undefined;
  let reason: unknown;
  const settled = Promise.resolve()
    .then(resolve)
    .then(
      (resolved) => {
        state = 'fulfilled';
        value = resolved;
      },
      (error: unknown) => {
        state = 'rejected';
        reason = error;
      },
    );
  const chunk = Object.defineProperties(settled, {
    status: { get: () => state },
    value: { get: () => value },
    reason: { get: () => reason },
  });
  const reference = {
    $$typeof: lazyReferenceType,
    _payload: chunk,
    _init: () => {
      if (state === 'fulfilled') return value;
      if (state === 'rejected') throw reason;
      throw chunk;
    },
  };
  if (!isFlightNode(reference)) throw new Error('Invalid Flight reference');
  return reference;
}
