export function member(target: unknown, name: string): unknown {
  if (
    (typeof target !== 'object' || target === null) &&
    typeof target !== 'function'
  )
    return undefined;
  return Reflect.get(target, name);
}

export function call(input: {
  target: unknown;
  method: string;
  args?: unknown[];
}): unknown {
  const method = member(input.target, input.method);
  if (typeof method !== 'function') return undefined;
  try {
    return Reflect.apply(method, input.target, input.args ?? []);
  } catch {
    return undefined;
  }
}

export function retain(script: HTMLScriptElement): () => boolean {
  script.dataset.users = String(Number(script.dataset.users ?? '0') + 1);
  return () => {
    const users = Math.max(0, Number(script.dataset.users) - 1);
    script.dataset.users = String(users);
    return users === 0;
  };
}

export function sdkScript(source: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.src = source;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.dataset.sapphireAnalytics = '';
  return script;
}
