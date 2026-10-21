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
    const rendered = example.render();
    if (root.closest('.docs-example')) {
      const elements = [rendered, ...rendered.querySelectorAll('*')];
      root.dataset.usageHtml = elements
        .filter(
          (element) =>
            element.localName.includes('-') &&
            !element.parentElement?.closest(
              'sapphire-banner, sapphire-site-header, sapphire-site-footer, cookie-banner, sapphire-toast, sapphire-analytics',
            ),
        )
        .map((element) => element.outerHTML)
        .join('\n');
    }
    root.replaceChildren(rendered);
  }
}
