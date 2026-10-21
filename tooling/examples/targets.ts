export function exampleTargets() {
  const inline = document.querySelectorAll<HTMLElement>(
    '[data-example-component][data-example-name]',
  );
  if (inline.length)
    return [...inline].map((root) => ({
      root,
      component: root.dataset.exampleComponent ?? '',
      name: root.dataset.exampleName ?? '',
    }));
  const params = new URL(location.href).searchParams;
  const root = document.getElementById('example');
  if (!root) throw new Error('The requested example target is missing');
  return [
    {
      root,
      component: params.get('component') ?? '',
      name: params.get('example') ?? '',
    },
  ];
}
