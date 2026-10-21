import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { parseSource } from '../source/parse';
import { escapeHtml, table } from './html';
import type { ComponentReference } from './props';

const inline = (text: string) => `<code>${escapeHtml(text)}</code>`;
const common = new Set([
  'children',
  'className',
  'style',
  'id',
  'ref',
  'disabled',
  'name',
  'value',
  'defaultValue',
  'onChange',
  'type',
  'href',
  'aria-label',
  'role',
  'tabIndex',
]);

function propsTable(
  name: string,
  props: ComponentReference[number]['branches'][number]['props'],
) {
  return table(
    name,
    ['Prop', 'Type', 'Required', 'Local default'],
    props.map((prop) => [
      inline(prop.name),
      inline(prop.type),
      prop.required ? 'Yes' : 'No',
      prop.defaultValue === undefined ? '—' : inline(prop.defaultValue),
    ]),
  );
}

function branchReference(
  name: string,
  branch: ComponentReference[number]['branches'][number],
  multiple: boolean,
) {
  const own = branch.props.filter((prop) => !prop.platform);
  const platform = branch.props.filter((prop) => prop.platform);
  return `${multiple ? `<h4>${escapeHtml(branch.name)}</h4>` : ''}${own.length ? propsTable(`${name} component props`, own) : '<p>No additional Sapphire props; accepts the platform props below.</p>'}${
    platform.length
      ? `<details class="docs-inherited"><summary>Inherited HTML / React props (${platform.length})</summary>${propsTable(
          `${name} common platform props`,
          platform.filter((prop) => common.has(prop.name)),
        )}<p>All inherited prop names:</p><p class="docs-prop-names">${platform.map((prop) => inline(prop.name)).join(' ')}</p><p>ARIA attributes and native event handlers keep their React types. <code>data-*</code> attributes are also accepted by React.</p></details>`
      : ''
  }`;
}

export function reactReference(reference: ComponentReference) {
  if (!reference.length)
    throw new Error('A React component page needs supported props');
  return `<p>Generated from the current public TypeScript signatures, including composed behaviour props. “—” means no default is declared in the local signature; forwarded behaviour defaults are not inferred.</p>${reference.map(referenceEntry).join('')}`;
}

function referenceEntry(entry: ComponentReference[number]) {
  const branches = entry.branches
    .map((branch) =>
      branchReference(entry.name, branch, entry.branches.length > 1),
    )
    .join('');
  const empty = entry.supporting
    ? table(`${entry.name} definition`, ['Type'], [[inline(entry.definition)]])
    : '<p>This component takes no props.</p>';
  return `<article class="docs-api-component"><h3>${entry.name}</h3>${entry.supporting ? '<p>Supporting type used by this API.</p>' : ''}${branches || empty}</article>`;
}

export function cssReference(root: string, name: string) {
  const css = readFileSync(
    join(root, `components/${name}/${name}.css`),
    'utf8',
  );
  const parts = [
    ...new Set(
      Array.from(css.matchAll(/\.(sp-[\w-]+)/g), (match) => match[1] ?? ''),
    ),
  ];
  const attributes = [
    ...new Set(
      Array.from(
        css.matchAll(/\[(data-[\w-]+)(?:="?([^"\]]+)"?)?\]/g),
        (match) => `${match[1]}${match[2] ? `="${match[2]}"` : ''}`,
      ),
    ),
  ];
  return `<p>CSS-only entry: use native HTML with these shared classes. There is no React component or React props API.</p>${table(
    'HTML parts',
    ['Class', 'Contract'],
    parts.map((part) => [inline(part), 'Shared styled HTML part']),
  )}${
    attributes.length
      ? table(
          'Supported data attributes',
          ['Attribute / value'],
          attributes.map((attribute) => [inline(attribute)]),
        )
      : ''
  }`;
}

function nativeAttribute(node: ts.Node, attributes: Set<string>) {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression)
  )
    return;
  const call = node.expression;
  if (!['getAttribute', 'hasAttribute'].includes(call.name.text)) return;
  if (!['this', 'host'].includes(call.expression.getText())) return;
  const arg = node.arguments[0];
  if (arg && ts.isStringLiteral(arg)) attributes.add(arg.text);
}

function nativeEvent(node: ts.Node, events: Set<string>) {
  if (!ts.isNewExpression(node) || node.expression.getText() !== 'CustomEvent')
    return;
  const name = node.arguments?.[0];
  if (name && ts.isStringLiteral(name)) events.add(name.text);
}

function nativeMethods(node: ts.Node, methods: Set<string>) {
  if (!ts.isMethodDeclaration(node) || !ts.isIdentifier(node.name)) return;
  if (
    [
      'connectedCallback',
      'disconnectedCallback',
      'attributeChangedCallback',
    ].includes(node.name.text)
  )
    return;
  methods.add(
    `${node.name.text}(${node.parameters.map((parameter) => parameter.getText()).join(', ')})`,
  );
}

function literalObjectKeys(value: ts.Expression | undefined): string[] {
  if (!value) return [];
  const object = ts.isAsExpression(value) ? value.expression : value;
  if (!ts.isObjectLiteralExpression(object)) return [];
  return object.properties.flatMap((property) => {
    const name = property.name;
    if (!name) return [];
    return ts.isStringLiteral(name) ? [name.text] : [name.getText()];
  });
}

function spreadAttributeKeys(expression: ts.Expression) {
  if (
    !ts.isCallExpression(expression) ||
    expression.expression.getText() !== 'Object.keys'
  )
    throw new Error('Native API: unsupported observedAttributes spread');
  const argument = expression.arguments[0];
  const declarations = expression
    .getSourceFile()
    .statements.flatMap((statement) =>
      ts.isVariableStatement(statement)
        ? [...statement.declarationList.declarations]
        : [],
    );
  const value = declarations.find(
    (declaration) => declaration.name.getText() === argument?.getText(),
  )?.initializer;
  const keys = literalObjectKeys(value);
  if (!keys.length)
    throw new Error('Native API: observedAttributes needs a literal object');
  return keys;
}

function attributeNames(item: ts.Expression) {
  if (ts.isStringLiteral(item)) return [item.text];
  if (ts.isSpreadElement(item)) return spreadAttributeKeys(item.expression);
  throw new Error('Native API: observedAttributes needs literal names');
}

function observedAttributes(node: ts.Node, attributes: Set<string>) {
  if (
    !ts.isPropertyDeclaration(node) ||
    node.name.getText() !== 'observedAttributes'
  )
    return;
  const value = node.initializer;
  if (!value || !ts.isArrayLiteralExpression(value)) return;
  for (const name of value.elements.flatMap(attributeNames))
    attributes.add(name);
}

function nativeTable(caption: string, heading: string, values: Set<string>) {
  return values.size
    ? table(
        caption,
        [heading],
        [...values].sort().map((value) => [inline(value)]),
      )
    : `<p>${caption}: none declared by this entry.</p>`;
}

export function nativeReference(root: string, name: string) {
  const file = join(root, `elements/${name}.ts`);
  const source = parseSource(file, readFileSync(file, 'utf8'));
  const attributes = new Set<string>();
  const methods = new Set<string>();
  const events = new Set<string>();
  const visit = (node: ts.Node): void => {
    nativeAttribute(node, attributes);
    nativeEvent(node, events);
    nativeMethods(node, methods);
    observedAttributes(node, attributes);
    ts.forEachChild(node, visit);
  };
  visit(source);
  return `<p>Native custom element: configure HTML attributes rather than React props. Boolean attributes use presence / absence. Registration is browser-only; server imports do not require a DOM and may export an undefined constructor.</p>${nativeTable('Supported attributes read or observed by this element', 'Attribute', attributes)}${nativeTable('Public methods', 'Method', methods)}${nativeTable('Emitted custom events', 'Event', events)}`;
}
