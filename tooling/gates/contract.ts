import { dirname, resolve } from 'node:path';
import { type CssContract, cssContract } from '../source/contract-css';
import { type JsxContract, jsxContract } from '../source/contract-jsx';
import { contractProgram } from '../source/contract-program';
import { radixImports, radixValues } from '../source/contract-radix';
import { finish, type GateResult, type Violation } from './report';
import { type FileText, loadFiles } from './scope';

const problem = (file: string, line: number, message: string): Violation => ({
  file,
  line,
  rule: 'P-4',
  problem: message,
  fix: 'Keep rendered classes and typed variant values equivalent to the CSS selectors; declare the base default explicitly.',
});
const classesFor = (jsx: JsxContract) =>
  new Set(jsx.classes.map((entry) => entry.name));

function renderedProblems(
  file: string,
  jsx: JsxContract,
  css: CssContract,
): Violation[] {
  const classes = jsx.classes
    .filter((entry) => !css.classes.has(entry.name))
    .map((entry) =>
      problem(
        file,
        entry.line,
        `Rendered class ${entry.name} has no CSS selector`,
      ),
    );
  const variants = jsx.variants.flatMap((entry) => {
    const metadata = ['data-slot', 'data-testid', 'data-lang'];
    if (
      metadata.some((name) => entry.key.endsWith(`/${name}`)) &&
      !css.variants.has(entry.key)
    )
      return [];
    const selectors = css.variants.get(entry.key) ?? new Set();
    return entry.values
      .filter((value) => !selectors.has(value) && value !== entry.fallback)
      .map((value) =>
        problem(
          file,
          entry.line,
          `${entry.key} value ${value} has no CSS selector or declared base default`,
        ),
      );
  });
  return [...classes, ...variants];
}

function selectorProblems(input: {
  file: string;
  renderers: { jsx: JsxContract; primitives: readonly string[] }[];
  css: CssContract;
}): Violation[] {
  const { file, renderers, css } = input;
  return [...css.variants].flatMap(([key, values]) => {
    const [className, attribute] = key.split('/');
    if (className === undefined || attribute === undefined) return [];
    const matching = renderers.filter(({ jsx }) =>
      classesFor(jsx).has(className),
    );
    if (matching.length === 0) return [];
    const declared = matching.flatMap(({ jsx }) =>
      jsx.variants
        .filter((entry) => entry.key === key)
        .flatMap((entry) => entry.values),
    );
    const allowed = new Set([
      ...declared,
      ...matching.flatMap(({ primitives }) =>
        radixValues(primitives, attribute),
      ),
    ]);
    return [...values]
      .filter((value) => !allowed.has(value))
      .map((value) =>
        problem(
          file,
          1,
          `${key} CSS selector value ${value} has no typed rendered value or matching Radix state`,
        ),
      );
  });
}

export function contractGate(input: {
  root: string;
  files: readonly FileText[];
}): GateResult {
  const files = input.files.filter(
    (file) =>
      /^(?:components|elements)\//.test(file.name) &&
      file.name.endsWith('.tsx') &&
      !/\.(?:examples|test|spec)\.tsx$/.test(file.name),
  );
  const css = cssContract(
    input.files
      .filter(
        (file) =>
          file.name.endsWith('.css') && !file.name.endsWith('.examples.css'),
      )
      .map((file) => file.text)
      .join('\n'),
  );
  const program = contractProgram({
    root: input.root,
    files: input.files.filter((file) => /\.tsx?$/.test(file.name)),
  });
  const checker = program.getTypeChecker();
  const renderers = files.flatMap((file) => {
    const source = program.getSourceFile(resolve(input.root, file.name));
    return source === undefined
      ? []
      : [
          {
            file: file.name,
            jsx: jsxContract(source, checker),
            primitives: radixImports(source),
          },
        ];
  });
  const violations = files.flatMap((file) => {
    const renderer = renderers.find((entry) => entry.file === file.name);
    return renderer === undefined
      ? [problem(file.name, 1, 'Component source was not analyzed')]
      : renderedProblems(file.name, renderer.jsx, css);
  });
  for (const folder of new Set(files.map((file) => dirname(file.name)))) {
    const owned = cssContract(
      input.files
        .filter(
          (file) =>
            dirname(file.name) === folder &&
            file.name.endsWith('.css') &&
            !file.name.endsWith('.examples.css'),
        )
        .map((file) => file.text)
        .join('\n'),
    );
    const local = renderers.filter((entry) => dirname(entry.file) === folder);
    const first = local[0];
    if (first !== undefined)
      violations.push(
        ...selectorProblems({ file: first.file, renderers: local, css: owned }),
      );
  }
  return { name: 'contract', files: files.length, violations };
}

if (import.meta.main) {
  finish(
    contractGate({
      root: process.cwd(),
      files: loadFiles(process.cwd(), process.argv.slice(2), [
        '.ts',
        '.tsx',
        '.css',
      ]),
    }),
  );
}
