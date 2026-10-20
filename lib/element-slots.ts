export function collectElementSlots(host: HTMLElement) {
  const slots = new Map<string, Node[]>();
  for (const node of Array.from(host.childNodes)) {
    const slot = node instanceof HTMLElement ? (node.dataset.slot ?? '') : '';
    const nodes = slots.get(slot) ?? [];
    nodes.push(node);
    slots.set(slot, nodes);
  }
  return slots;
}

export function appendElementSlot(
  parent: HTMLElement,
  {
    nodes,
    className,
    slot,
    tag = 'div',
  }: {
    nodes: readonly Node[];
    className: string;
    slot?: string;
    tag?: string;
  },
) {
  const wrapper = parent.ownerDocument.createElement(tag);
  wrapper.className = className;
  if (slot) wrapper.dataset.sapphireSlot = slot;
  wrapper.append(...nodes);
  parent.append(wrapper);
  return wrapper;
}
