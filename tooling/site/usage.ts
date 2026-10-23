import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import ts from 'typescript';
import type { ExampleRow } from '../examples/catalog';
import { parseSource } from '../source/parse';
import { expandedExampleSource } from './example-modules';
import { code, escapeHtml } from './html';
import { componentSetup } from './setup';

function identifiers(node: ts.Node) {
  const names = new Set<string>();
  const visit = (child: ts.Node): void => {
    if (ts.isIdentifier(child)) names.add(child.text);
    ts.forEachChild(child, visit);
  };
  visit(node);
  return names;
}

function declarations(statement: ts.Statement) {
  if (ts.isVariableStatement(statement))
    return statement.declarationList.declarations.map((item) =>
      item.name.getText(),
    );
  if (
    ts.isFunctionDeclaration(statement) ||
    ts.isClassDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement)
  )
    return statement.name ? [statement.name.text] : [];
  return [];
}

function packagePath(root: string, file: string, path: string) {
  if (!path.startsWith('.')) return path;
  const target = relative(root, resolve(root, dirname(file), path)).replace(
    /\.js$/,
    '',
  );
  const parts = target.split('/');
  if (parts[0] === 'components') return `@kongmy-dev/sapphire-ui/${parts[1]}`;
  if (parts[0] === 'lib') return `@kongmy-dev/sapphire-ui/${parts[1]}`;
  return `@kongmy-dev/sapphire-ui/${target}`;
}

function namedImports(
  bindings: ts.NamedImportBindings | undefined,
  used: Set<string>,
) {
  if (!bindings) return '';
  if (ts.isNamespaceImport(bindings))
    return used.has(bindings.name.text) ? bindings.getText() : '';
  const items = bindings.elements.filter((item) => used.has(item.name.text));
  return items.length
    ? `{ ${items.map((item) => item.getText()).join(', ')} }`
    : '';
}

function imported(
  statement: ts.ImportDeclaration,
  used: Set<string>,
  root: string,
  file: string,
) {
  const clause = statement.importClause;
  if (!clause || !ts.isStringLiteral(statement.moduleSpecifier)) return '';
  const defaultName =
    clause.name && used.has(clause.name.text) ? clause.name.text : '';
  const members = [
    defaultName,
    namedImports(clause.namedBindings, used),
  ].filter(Boolean);
  if (!members.length) return '';
  return `import ${clause.isTypeOnly ? 'type ' : ''}${members.join(', ')} from "${packagePath(root, file, statement.moduleSpecifier.text)}";`;
}

function property(node: ts.ObjectLiteralExpression, name: string) {
  const found = node.properties.find(
    (item) => ts.isPropertyAssignment(item) && item.name.getText() === name,
  );
  return found && ts.isPropertyAssignment(found)
    ? found.initializer
    : undefined;
}

function renderer(source: ts.SourceFile, row: ExampleRow) {
  let render = '';
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralExpression(node)) {
      const name = property(node, 'name');
      if (name && ts.isStringLiteral(name) && name.text === row.name)
        render = property(node, 'render')?.getText() ?? '';
    }
    ts.forEachChild(node, visit);
  };
  const registration = source.statements.find((statement) =>
    declarations(statement).includes('examples'),
  );
  if (registration) visit(registration);
  if (!render) throw new Error(`${row.file}: missing render for ${row.name}`);
  return render;
}

function dependencyClosure(source: ts.SourceFile, render: string) {
  const used = new Set([render]);
  const selected = new Set<ts.Statement>();
  const indexed = new Map(
    source.statements.flatMap((statement) =>
      declarations(statement).map((name) => [name, statement] as const),
    ),
  );
  for (const name of used) {
    const statement = indexed.get(name);
    if (!statement || selected.has(statement)) continue;
    selected.add(statement);
    for (const dependency of identifiers(statement)) used.add(dependency);
  }
  return { used, selected };
}

function consumeImport(
  statement: ts.ImportDeclaration,
  remaining: Set<string>,
) {
  const clause = statement.importClause;
  if (clause?.name) remaining.delete(clause.name.text);
  const bindings = clause?.namedBindings;
  if (!bindings) return;
  if (ts.isNamespaceImport(bindings)) remaining.delete(bindings.name.text);
  else for (const item of bindings.elements) remaining.delete(item.name.text);
}

export function exampleSource(root: string, row: ExampleRow) {
  const source = expandedExampleSource(root, row);
  const render = renderer(source, row);
  const { used, selected } = dependencyClosure(source, render);
  const remaining = new Set(used);
  const imports = source.statements
    .filter(ts.isImportDeclaration)
    .map((statement) => {
      const declaration = imported(statement, remaining, root, row.file);
      consumeImport(statement, remaining);
      return declaration;
    })
    .filter(Boolean);
  return [
    '"use client";',
    ...imports,
    '',
    ...source.statements
      .filter((item) => selected.has(item))
      .map((item) => item.getText()),
    '',
    `export default ${render};`,
  ].join('\n');
}

export function exampleUsage(root: string, row: ExampleRow, native: boolean) {
  const source = native ? '' : exampleSource(root, row);
  const stylesheet = join(root, row.file.replace(/\.tsx$/, '.css'));
  const styles =
    !native && existsSync(stylesheet)
      ? `<details class="docs-usage"><summary>Example CSS</summary><p>Load these demo styles alongside the package stylesheet for the same layout and surfaces.</p>${code(readFileSync(stylesheet, 'utf8'), 'CSS')}</details>`
      : '';
  const jsx = native
    ? ''
    : `<details class="docs-usage"><summary>JSX usage</summary><p>Install this example’s dependencies, load the package stylesheet from Setup, and add Example CSS where shown. The snippet includes its local helpers.</p>${code(exampleInstall(root, source), 'install command')}${code(source, 'JSX')}</details>`;
  return `${jsx}${styles}<details class="docs-usage" data-html-usage><summary>HTML markup</summary><p>${native ? 'Authored custom-element markup. Register the element using Setup below. Demo buttons and their JavaScript handlers are omitted; use the methods and events in the API reference.' : 'Initial rendered HTML only. React handlers and portalled content require the JSX example; static HTML does not reproduce those interactions.'}</p><div data-html-source aria-label="${escapeHtml(row.name)} HTML markup"></div></details>`;
}

function importRequirements(root: string, specifier: string) {
  if (!specifier.startsWith('@kongmy-dev/sapphire-ui/')) return [specifier];
  const name = specifier.replace('@kongmy-dev/sapphire-ui/', '');
  if (!existsSync(join(root, `components/${name}/${name}.tsx`))) return [];
  return componentSetup(root, name, false)
    .install.slice('bun add '.length)
    .split(' ');
}

function exampleInstall(root: string, source: string) {
  const imports = parseSource('usage.tsx', source).statements.filter(
    ts.isImportDeclaration,
  );
  const dependencies = new Set([
    '@kongmy-dev/sapphire-ui',
    'react',
    'react-dom',
  ]);
  for (const statement of imports) {
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const specifier = statement.moduleSpecifier.text;
    for (const dependency of importRequirements(root, specifier))
      dependencies.add(dependency);
  }
  return `bun add ${[...dependencies].join(' ')}`;
}
