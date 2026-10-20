import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { parseSource } from '../source/parse';
import type { Scheme } from '../source/token-values';

export const EXAMPLE_PORT = 4176;
export const EXAMPLE_URL = `http://localhost:${EXAMPLE_PORT}`;

export type ExampleRow = {
  readonly component: string;
  readonly file: string;
  readonly name: string;
};

const STABLE_NAME = /^[a-z][a-z0-9-]*$/;

function property(object: ts.ObjectLiteralExpression, name: string) {
  const found = object.properties.find(
    (item) => ts.isPropertyAssignment(item) && item.name.getText() === name,
  );
  return found && ts.isPropertyAssignment(found) ? found.initializer : null;
}

function exampleName(node: ts.Expression, file: string): string {
  if (!ts.isObjectLiteralExpression(node))
    throw new Error(`${file}: each example must be an object`);
  const name = property(node, 'name');
  const render = property(node, 'render');
  if (!name || !ts.isStringLiteral(name) || !STABLE_NAME.test(name.text))
    throw new Error(
      `${file}: example names must be literal kebab-case strings`,
    );
  if (!render || !ts.isIdentifier(render) || !/^[A-Z]/.test(render.text))
    throw new Error(`${file}: render must name a React component`);
  return name.text;
}

export function namesFromSource(file: string, text: string): string[] {
  const source = parseSource(file, text);
  const declarations = source.statements
    .filter(ts.isVariableStatement)
    .filter((statement) =>
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ),
    )
    .flatMap((statement) => [...statement.declarationList.declarations]);
  const declared = declarations.find(
    (item) => ts.isIdentifier(item.name) && item.name.text === 'examples',
  )?.initializer;
  const array =
    declared && ts.isAsExpression(declared) ? declared.expression : declared;
  if (!array || !ts.isArrayLiteralExpression(array) || !array.elements.length)
    throw new Error(`${file}: export a non-empty literal examples array`);
  const names = array.elements.map((node) => exampleName(node, file));
  if (new Set(names).size !== names.length)
    throw new Error(`${file}: example names must be unique`);
  return names;
}

export function readExamples(root: string): ExampleRow[] {
  const directory = join(root, 'components');
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && STABLE_NAME.test(entry.name))
    .flatMap(({ name: component }) => {
      const file = `components/${component}/${component}.examples.tsx`;
      const path = join(root, file);
      if (!existsSync(path)) return [];
      return namesFromSource(file, readFileSync(path, 'utf8')).map((name) => ({
        component,
        file,
        name,
      }));
    })
    .sort((left, right) =>
      `${left.component}/${left.name}`.localeCompare(
        `${right.component}/${right.name}`,
      ),
    );
}

export const exampleUrl = (example: ExampleRow, scheme: Scheme): string =>
  `${EXAMPLE_URL}/?${new URLSearchParams({
    component: example.component,
    example: example.name,
    scheme,
  })}`;
