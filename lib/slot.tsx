import {
  cloneElement,
  Fragment,
  type HTMLAttributes,
  isValidElement,
  type ReactNode,
  type Ref,
  use,
  useMemo,
} from 'react';

type SlotRef = Ref<HTMLElement> | undefined;
type SlotProps = HTMLAttributes<HTMLElement> & {
  ref?: SlotRef;
  children?: ReactNode;
};
type ElementProps = Record<string, unknown>;
type RefCleanup = ReturnType<typeof setRef>;

const lazyType = Symbol.for('react.lazy');
const handlerKey = /^on[A-Z]/;

function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

function isRecord(value: unknown): value is ElementProps {
  return typeof value === 'object' && value !== null;
}

function isRef(value: unknown): value is Ref<HTMLElement> {
  return isFunction(value) || (isRecord(value) && 'current' in value);
}

function isLazyReference(
  value: unknown,
): value is { _payload: PromiseLike<ReactNode> } {
  return (
    isRecord(value) &&
    value.$$typeof === lazyType &&
    isRecord(value._payload) &&
    typeof value._payload.then === 'function'
  );
}

function unwrapLazy(node: ReactNode): ReactNode {
  let current = node;
  while (isLazyReference(current)) current = use(current._payload);
  return current;
}

function setRef(ref: SlotRef, node: HTMLElement | null) {
  if (typeof ref === 'function') return ref(node);
  if (ref) ref.current = node;
}

function releaseRef(ref: SlotRef, cleanup: RefCleanup) {
  if (isFunction(cleanup)) cleanup();
  else setRef(ref, null);
}

function composeRefs(first: SlotRef, second: SlotRef) {
  const refs = [first, second];
  return (node: HTMLElement | null) => {
    const cleanups: RefCleanup[] = refs.map((ref) => setRef(ref, node));
    if (!cleanups.some(isFunction)) return;
    return () =>
      refs.forEach((ref, index) => {
        releaseRef(ref, cleanups[index]);
      });
  };
}

function mergeDescribedBy(...values: unknown[]) {
  const ids = new Set(
    values.flatMap((value) =>
      typeof value === 'string' ? value.trim().split(/\s+/) : [],
    ),
  );
  ids.delete('');
  return ids.size > 0 ? [...ids].join(' ') : undefined;
}

function mergeHandler(slotValue: unknown, childValue: unknown) {
  if (!isFunction(slotValue) || !isFunction(childValue)) {
    return slotValue || childValue;
  }
  return (...args: unknown[]) => {
    const result = childValue(...args);
    slotValue(...args);
    return result;
  };
}

function styleRecord(value: unknown) {
  return isRecord(value) ? value : {};
}

function mergeValue(key: string, slotValue: unknown, childValue: unknown) {
  if (handlerKey.test(key)) return mergeHandler(slotValue, childValue);
  if (key === 'style') {
    return {
      ...styleRecord(slotValue),
      ...styleRecord(childValue),
    };
  }
  if (key === 'className')
    return [slotValue, childValue].filter(Boolean).join(' ');
  if (key === 'aria-describedby')
    return mergeDescribedBy(childValue, slotValue);
  return childValue;
}

function mergeProps(
  slotProps: ElementProps,
  childProps: ElementProps,
): ElementProps {
  const merged = Object.fromEntries(
    Object.entries(childProps).map(([key, value]) => [
      key,
      mergeValue(key, slotProps[key], value),
    ]),
  );
  return { ...slotProps, ...merged };
}

function emptyChild(children: ReactNode) {
  if (children || children === 0) {
    throw new Error(
      'Slot failed to slot onto its children. Expected a single React element child.',
    );
  }
  return children;
}

function childReference(props: ElementProps | undefined) {
  return isRef(props?.ref) ? props.ref : null;
}

export function Slot({ children: rawChildren, ref, ...slotProps }: SlotProps) {
  const children = unwrapLazy(rawChildren);
  const child = isValidElement<ElementProps>(children) ? children : null;
  const childRef = childReference(child?.props);
  const composedRef = useMemo(
    () => composeRefs(ref, childRef),
    [ref, childRef],
  );

  if (!child) return emptyChild(children);

  const merged = mergeProps(slotProps, child.props);
  if (ref && child.type !== Fragment) merged.ref = composedRef;
  return cloneElement(child, merged);
}
