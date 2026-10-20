import ts from 'typescript';
import { parseSource } from '../source/parse.js';
import type { Attribute } from './attributes.js';
import {
  manualApiChanges,
  manualFunctionChanges,
  propValueRenames,
  subpathRenames,
} from './map.js';
import { issueAt, type Migration } from './result.js';

const packageName = '@kongmy-dev/sapphire-ui';
export const isSapphire = (name: string) =>
  name === packageName || name.startsWith(`${packageName}/`);
const paths: Readonly<Record<string, string>> = subpathRenames;
const props: Readonly<
  Record<string, Readonly<Record<string, Readonly<Record<string, string>>>>>
> = propValueRenames;
const manual: Readonly<Record<string, Readonly<Record<string, string>>>> =
  manualApiChanges;

export function migrateImport(
  text: string,
  literal: ts.StringLiteral,
  migration: Migration,
) {
  const name = literal.text;
  if (name === packageName)
    migration.issues.push(
      issueAt(
        text,
        literal.getStart(),
        'Root imports are removed; split named imports into their public component/helper subpaths',
      ),
    );
  if (!name.startsWith(`${packageName}/`)) return;
  const subpath = name.slice(packageName.length + 1);
  const replacement = paths[subpath];
  if (replacement)
    migration.edits.push({
      start: literal.getStart() + 1,
      end: literal.getEnd() - 1,
      text: `${packageName}/${replacement}`,
    });
  if (
    ['theme.css', 'sapphire-ui.css', 'stylelint', 'elements', 'icon'].includes(
      subpath,
    )
  )
    migration.issues.push(
      issueAt(
        text,
        literal.getStart(),
        `${subpath}: choose sapphire.css/tailwind.css/foundations.css, remove the Stylelint preset, replace font icons with SVG, or use individual elements/<name> imports as appropriate`,
      ),
    );
}

function importedNames(statement: ts.ImportDeclaration) {
  const bindings = statement.importClause?.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings)) return [];
  return bindings.elements.map(
    (element) =>
      [
        element.name.text,
        element.propertyName?.text ?? element.name.text,
      ] as const,
  );
}
function namespaceNotice(
  text: string,
  statement: ts.ImportDeclaration,
  migration: Migration,
) {
  const bindings = statement.importClause?.namedBindings;
  if (bindings && ts.isNamespaceImport(bindings))
    migration.issues.push(
      issueAt(
        text,
        statement.getStart(),
        'Namespace component access needs manual prop migration',
      ),
    );
}

function importNotice(imported: string) {
  if (imported === 'useLocalStorage')
    return manualFunctionChanges.useLocalStorage;
  if (/Variants$/.test(imported))
    return `${imported}: variant helpers are removed; use component props or sp-* classes and data attributes`;
  return '';
}

function collectNames(
  text: string,
  statement: ts.ImportDeclaration,
  migration: Migration,
  names: Map<string, string>,
) {
  for (const [name, imported] of importedNames(statement)) {
    names.set(name, imported);
    const notice = importNotice(imported);
    if (notice)
      migration.issues.push(issueAt(text, statement.getStart(), notice));
  }
}

export function componentImports(
  file: string,
  text: string,
  migration: Migration,
) {
  const source = parseSource(file, text);
  const names = new Map<string, string>();
  for (const statement of source.statements.filter(ts.isImportDeclaration)) {
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
    migrateImport(text, statement.moduleSpecifier, migration);
    if (!isSapphire(statement.moduleSpecifier.text)) continue;
    namespaceNotice(text, statement, migration);
    collectNames(text, statement, migration, names);
  }
  return names;
}

function propValue(
  text: string,
  imported: string,
  attribute: Attribute,
  migration: Migration,
) {
  const values = props[imported]?.[attribute.name];
  if (!values) return;
  if (attribute.value === null) {
    migration.issues.push(
      issueAt(
        text,
        attribute.start,
        `${imported}.${attribute.name}: dynamic value needs manual migration`,
      ),
    );
    return;
  }
  const replacement = values[attribute.value];
  if (replacement)
    migration.edits.push({
      start: attribute.valueStart,
      end: attribute.valueEnd,
      text: replacement,
    });
}
function manualProp(
  text: string,
  imported: string,
  attribute: Attribute,
  migration: Migration,
) {
  const message = manual[imported]?.[attribute.name];
  if (!message) return;
  if (
    attribute.name === 'icon' &&
    /=\{\s*</.test(text.slice(attribute.start, attribute.end))
  )
    return;
  migration.issues.push(
    issueAt(text, attribute.start, `${imported}.${attribute.name}: ${message}`),
  );
}

export function migrateProps(
  text: string,
  name: string,
  attributes: Attribute[],
  names: Map<string, string>,
  migration: Migration,
) {
  const imported = names.get(name);
  if (!imported) return;
  for (const attribute of attributes) {
    propValue(text, imported, attribute, migration);
    manualProp(text, imported, attribute, migration);
  }
}
