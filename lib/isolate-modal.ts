function inertSiblings(current: Element): HTMLElement[] {
  return Array.from(current.parentElement?.children ?? [])
    .filter(
      (sibling): sibling is HTMLElement =>
        sibling instanceof HTMLElement &&
        sibling !== current &&
        (!sibling.inert || sibling.dataset.sapphireInertCount !== undefined) &&
        !sibling.matches('[aria-live], [role="status"]'),
    )
    .map((sibling) => {
      sibling.dataset.sapphireInertCount = String(
        Number(sibling.dataset.sapphireInertCount ?? 0) + 1,
      );
      sibling.inert = true;
      return sibling;
    });
}

function release(element: HTMLElement) {
  const remaining = Number(element.dataset.sapphireInertCount) - 1;
  if (remaining > 0) {
    element.dataset.sapphireInertCount = String(remaining);
    return;
  }
  delete element.dataset.sapphireInertCount;
  element.inert = false;
}

export function isolateModal(viewport: HTMLDivElement | null) {
  if (!viewport?.isConnected) return;
  const changed: HTMLElement[] = [];
  let current: Element = viewport;
  while (current.parentElement && current !== viewport.ownerDocument.body) {
    changed.push(...inertSiblings(current));
    current = current.parentElement;
  }
  return () => {
    for (const element of changed.splice(0)) release(element);
  };
}
