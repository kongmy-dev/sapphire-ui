type NativeExample = {
  readonly name: string;
  readonly render: () => HTMLElement;
};

export function mountElementExample(
  catalog: Readonly<Record<string, readonly NativeExample[]>>,
) {
  const params = new URL(location.href).searchParams;
  const example = catalog[params.get('component') ?? '']?.find(
    ({ name }) => name === params.get('example'),
  );
  const root = document.getElementById('example');
  if (!root || !example)
    throw new Error('The requested native example is missing');
  root.replaceChildren(example.render());
}
