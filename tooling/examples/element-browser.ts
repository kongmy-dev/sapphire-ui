import { exampleTargets } from './targets';

type NativeExample = {
  readonly name: string;
  readonly render: () => HTMLElement;
};

export function mountElementExample(
  catalog: Readonly<Record<string, readonly NativeExample[]>>,
) {
  for (const { root, component, name } of exampleTargets()) {
    const example = catalog[component]?.find(
      (example) => example.name === name,
    );
    if (!example)
      throw new Error(
        `The requested native example ${component}/${name} is missing`,
      );
    root.replaceChildren(example.render());
  }
}
