import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import ts from 'typescript';
import { cssImports } from '../source/css-imports';
import { type ImportEdge, sourceImports } from '../source/imports';
import { finish, type GateResult, type Violation } from './report';
import { type FileText, loadFiles } from './scope';

const RUNTIME = [
  'components',
  'hooks',
  'lib',
  'elements',
  'blocks',
  'site',
  'css',
];
const ALLOWED: Record<string, readonly string[]> = {
  css: ['css'],
  lib: ['lib'],
  hooks: ['hooks', 'lib'],
  components: ['components', 'hooks', 'lib'],
  elements: ['lib'],
  blocks: ['components', 'hooks', 'lib', 'blocks'],
  site: RUNTIME,
};
const EXTERNALS: Record<string, readonly string[]> = {
  lib: ['react', 'react-dom'],
  hooks: ['react', 'react-dom'],
  components: ['react', 'react-dom', 'radix-ui', 'react-resizable-panels'],
  elements: [],
  css: ['@fontsource-variable'],
};
const layer = (name: string) => name.split('/')[0] ?? '';
const isSupport = (name: string) =>
  name.split('/').some((part) => part.endsWith('-tests'));
const isTest = (name: string) =>
  /\.(?:test|spec)\.[cm]?tsx?$/.test(name) || isSupport(name);
const isStrictTest = (name: string) =>
  isTest(name) &&
  (RUNTIME.includes(layer(name)) || name.startsWith('tests/components/'));
const packageOf = (name: string) =>
  name.startsWith('@')
    ? name.split('/').slice(0, 2).join('/')
    : (name.split('/')[0] ?? '');
const isPublic = (name: string) => {
  if (/\.examples\.tsx?$/.test(name)) return true;
  if (layer(name) === 'elements')
    return name.split('/').length === 2 && !isTest(name);
  if (layer(name) === 'hooks' || layer(name) === 'lib') return !isTest(name);
  const parts = name.split('/');
  return (
    parts.length === 3 && parts[2]?.replace(/\.[cm]?tsx?$/, '') === parts[1]
  );
};

function problem(file: string, edge: ImportEdge, message: string): Violation {
  return {
    file,
    line: edge.line,
    rule: 'P-2',
    problem: message,
    fix: 'Import only an allowed lower layer or the public component/example entry.',
  };
}

const canUseExample = (file: string, target: string) =>
  !target.includes('.examples.') || layer(file) === 'site';
const canUseIcons = (file: string, specifier: string) =>
  file.endsWith('.examples.tsx') && packageOf(specifier) === 'lucide-react';

const isNativeExampleImport = (file: string, target: string) =>
  file.startsWith('elements/') &&
  file.endsWith('.examples.ts') &&
  layer(target) === 'elements' &&
  isPublic(target);

const allowedLayer = (file: string, target: string) =>
  isNativeExampleImport(file, target) ||
  ALLOWED[layer(file)]?.includes(layer(target));

function localProblems(input: {
  file: string;
  edge: ImportEdge;
  target: string;
}): Violation[] {
  const { file, edge, target } = input;
  if (isStrictTest(file))
    return isPublic(target) || isSupport(target)
      ? []
      : [problem(file, edge, `Test imports private module ${target}`)];
  const allowed = allowedLayer(file, target);
  const isRuntime = !isTest(target) && canUseExample(file, target);
  return allowed && isRuntime
    ? []
    : [problem(file, edge, `Forbidden dependency on ${target}`)];
}

function testPackageProblems(input: {
  file: string;
  edge: ImportEdge;
  specifier: string;
}): Violation[] {
  const { file, edge, specifier } = input;
  const allowed = [
    'bun:test',
    'react',
    'react-dom',
    '@testing-library/react',
    '@testing-library/user-event',
    '@playwright/test',
    '@radix-ui/react-slot',
    'radix-ui',
    'react-resizable-panels',
  ];
  const isTableBlock =
    layer(file) === 'blocks' &&
    packageOf(specifier) === '@tanstack/react-table';
  return allowed.includes(packageOf(specifier)) || isTableBlock
    ? []
    : [problem(file, edge, `Unverified test package ${specifier}`)];
}

const isLocalSpecifier = (specifier: string) =>
  specifier.startsWith('.') || specifier.startsWith('/');

function edgeProblem(input: {
  file: string;
  edge: ImportEdge;
  target: string | null;
}): Violation[] {
  const { file, edge, target } = input;
  const specifier = edge.specifier;
  if (specifier === null)
    return [
      problem(file, edge, 'Computed imports cannot be statically verified'),
    ];
  if (target !== null) return localProblems({ file, edge, target });
  if (isLocalSpecifier(specifier))
    return [problem(file, edge, `Unresolved local import ${specifier}`)];
  if (isStrictTest(file)) return testPackageProblems({ file, edge, specifier });
  if (canUseIcons(file, specifier)) return [];
  const external = EXTERNALS[layer(file)];
  if (external === undefined || external.includes(packageOf(specifier)))
    return [];
  return [problem(file, edge, `Forbidden package ${specifier}`)];
}

export function boundaryGate(input: {
  root: string;
  files: readonly FileText[];
  options?: ts.CompilerOptions;
}): GateResult {
  const names = new Set(
    input.files.map((file) => resolve(input.root, file.name)),
  );
  const host: ts.ModuleResolutionHost = {
    fileExists: (path) => names.has(path) || ts.sys.fileExists(path),
    readFile: ts.sys.readFile,
  };
  const files = input.files.filter(
    (file) =>
      (RUNTIME.includes(layer(file.name)) &&
        /\.(?:[cm]?tsx?|css)$/.test(file.name)) ||
      isStrictTest(file.name),
  );
  const violations = files.flatMap((file) =>
    (file.name.endsWith('.css')
      ? cssImports(file.text)
      : sourceImports(file.name, file.text)
    ).flatMap((edge) => {
      const resolved =
        edge.specifier === null
          ? undefined
          : ts.resolveModuleName(
              edge.specifier,
              resolve(input.root, file.name),
              {
                moduleResolution: ts.ModuleResolutionKind.Bundler,
                ...input.options,
              },
              host,
            ).resolvedModule;
      const direct =
        edge.specifier === null
          ? ''
          : resolve(input.root, dirname(file.name), edge.specifier);
      const directTarget = names.has(direct)
        ? relative(input.root, direct)
        : null;
      const target =
        resolved !== undefined && !resolved.isExternalLibraryImport
          ? relative(input.root, resolved.resolvedFileName)
          : directTarget;
      return edgeProblem({ file: file.name, edge, target });
    }),
  );
  return { name: 'boundary', files: files.length, violations };
}

if (import.meta.main) {
  const root = process.cwd();
  finish(
    boundaryGate({
      root,
      files: loadFiles(root, process.argv.slice(2), ['.ts', '.tsx', '.css']),
      options: ts.parseJsonConfigFileContent(
        ts.parseConfigFileTextToJson(
          'tsconfig.base.json',
          readFileSync(resolve(root, 'tsconfig.base.json'), 'utf8'),
        ).config,
        ts.sys,
        root,
      ).options,
    }),
  );
}
