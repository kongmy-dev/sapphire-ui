function inertSiblings(current: Element): HTMLElement[] {
  return Array.from(current.parentElement?.children ?? [])
    .filter(
      (sibling): sibling is HTMLElement =>
        sibling instanceof HTMLElement &&
        sibling !== current &&
        !sibling.inert &&
        !sibling.matches('[aria-live], [role="status"]'),
    )
    .map((sibling) => {
      sibling.inert = true;
      return sibling;
    });
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
    for (const element of changed) element.inert = false;
  };
}
