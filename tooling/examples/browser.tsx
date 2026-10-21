import { type ComponentType, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { exampleTargets } from './targets';

type Example = {
  readonly name: string;
  readonly render: ComponentType;
};

export function mountExample(
  catalog: Readonly<Record<string, readonly Example[]>>,
) {
  for (const { root, component, name } of exampleTargets()) {
    const example = catalog[component]?.find(
      (example) => example.name === name,
    );
    if (!example)
      throw new Error(`The requested example ${component}/${name} is missing`);
    createRoot(root, { identifierPrefix: `${component}-${name}-` }).render(
      createElement(example.render),
    );
  }
}
