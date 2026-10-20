import ts from 'typescript';
import { issueAt, type Migration } from './result.js';

export function validScript(file: string, text: string, migration: Migration) {
  const diagnostics =
    ts.transpileModule(text, {
      fileName: file,
      reportDiagnostics: true,
      compilerOptions: {
        jsx: ts.JsxEmit.Preserve,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
      },
    }).diagnostics ?? [];
  const errors = diagnostics.filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  for (const error of errors)
    migration.issues.push(
      issueAt(
        text,
        error.start ?? 0,
        'Source syntax could not be parsed safely; migrate this file manually',
      ),
    );
  return errors.length === 0;
}

function bindingNames(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text];
  return name.elements.flatMap((element) =>
    ts.isBindingElement(element) ? bindingNames(element.name) : [],
  );
}

function declaredNames(node: ts.Node): string[] {
  if (ts.isParameter(node) || ts.isVariableDeclaration(node))
    return bindingNames(node.name);
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isClassExpression(node)
  )
    return node.name ? [node.name.text] : [];
  return [];
}

export function removeShadowed(
  source: ts.SourceFile,
  names: Map<string, string>,
  migration: Migration,
) {
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isIdentifier(node.initializer) &&
      names.has(node.initializer.text)
    )
      migration.issues.push(
        issueAt(
          source.text,
          node.getStart(),
          'Aliased component reference needs manual prop migration',
        ),
      );
    for (const name of declaredNames(node).filter((name) => names.has(name))) {
      names.delete(name);
      migration.issues.push(
        issueAt(
          source.text,
          node.getStart(),
          `${name}: a local binding may shadow the Sapphire import; migrate its uses manually`,
        ),
      );
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
}
