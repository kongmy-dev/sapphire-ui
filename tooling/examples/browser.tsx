import { type ComponentType, createElement } from 'react';
import { createRoot } from 'react-dom/client';

type Example = {
  readonly name: string;
  readonly render: ComponentType;
};

export function mountExample(
  catalog: Readonly<Record<string, readonly Example[]>>,
) {
  const params = new URL(location.href).searchParams;
  const examples = catalog[params.get('component') ?? ''];
  const example = examples?.find(({ name }) => name === params.get('example'));
  const root = document.getElementById('example');
  if (!root || !example) throw new Error('The requested example is missing');
  createRoot(root).render(createElement(example.render));
}
