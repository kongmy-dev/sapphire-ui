import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import type { ExampleRow } from '../examples/catalog';
import { resolvedModule } from '../registry/source';
import { parseSource } from '../source/parse';

function privateTarget(root: string, row: ExampleRow, statement: ts.Statement) {
  if (
    !ts.isImportDeclaration(statement) ||
    !ts.isStringLiteral(statement.moduleSpecifier)
  )
    return undefined;
  const path = statement.moduleSpecifier.text;
  if (!path.startsWith(`./${row.component}-`) || !/\.examples\.js$/.test(path))
    return undefined;
  const target = resolvedModule(root, row.file, path);
  if (dirname(target) !== dirname(row.file))
    throw new Error(`${row.file}: private example helpers must be siblings`);
  return target;
}

function importedAliases(statement: ts.Statement) {
  if (!ts.isImportDeclaration(statement)) return '';
  const bindings = statement.importClause?.namedBindings;
  if (!bindings || !ts.isNamedImports(bindings) || statement.importClause?.name)
    throw new Error('Private example helpers require named imports');
  return bindings.elements
    .flatMap((item) => {
      if (!item.propertyName) return [];
      const declaration =
        statement.importClause?.isTypeOnly || item.isTypeOnly
          ? 'type'
          : 'const';
      return [`${declaration} ${item.name.text} = ${item.propertyName.text};`];
    })
    .join('\n');
}

export function expandedExampleSource(root: string, row: ExampleRow) {
  const visited = new Set<string>();
  const sources: string[] = [];
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = parseSource(file, readFileSync(join(root, file), 'utf8'));
    const statements = source.statements.map((statement) => {
      const target = privateTarget(root, { ...row, file }, statement);
      if (!target) return statement.getText();
      visit(target);
      return importedAliases(statement);
    });
    sources.push(statements.join('\n'));
  }
  visit(row.file);
  return parseSource(row.file, sources.join('\n'));
}
