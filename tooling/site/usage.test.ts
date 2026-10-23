import { afterAll, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import ts from 'typescript';
import { readExamples } from '../examples/catalog';
import { exampleSource, exampleUsage } from './usage';

const root = mkdtempSync(join(tmpdir(), 'sapphire-usage-'));
afterAll(() => rmSync(root, { recursive: true, force: true }));

test('usage includes the selected example, its helpers and public imports', () => {
  mkdirSync(join(root, 'components/button'), { recursive: true });
  const row = {
    component: 'button',
    name: 'selected',
    file: 'components/button/button.examples.tsx',
  };
  writeFileSync(
    join(root, row.file),
    `
    import { useState, useEffect } from 'react';
    import { Button } from './button.js';
    const initial = 'Hello';
    function Helper() { return <span>{initial}</span>; }
    function Selected() { const [value] = useState(initial); return <Button>{value}<Helper /></Button>; }
    function Other() { useEffect(() => {}); return <p>Other</p>; }
    export const examples = [{name: 'selected', render: Selected}, {name: 'other', render: Other}] as const;
  `,
  );
  const source = exampleSource(root, row);
  expect(source).toBe(`"use client";
import { useState } from "react";
import { Button } from "@kongmy-dev/sapphire-ui/button";

const initial = 'Hello';
function Helper() { return <span>{initial}</span>; }
function Selected() { const [value] = useState(initial); return <Button>{value}<Helper /></Button>; }

export default Selected;`);
  expect(source).toContain('@kongmy-dev/sapphire-ui/button');
  expect(source).toContain('function Selected');
  expect(source).toContain('function Helper');
  expect(source).toContain("const initial = 'Hello'");
  expect(source).toContain('export default Selected');
  expect(source).not.toContain('function Other');
  expect(source).not.toContain('useEffect');
  expect(source).not.toContain('export const examples');
  expect(() => exampleSource(root, { ...row, name: 'missing' })).toThrow(
    'missing render',
  );
});

test('every catalogue JSX snippet typechecks against current public entry points', async () => {
  const project = process.cwd();
  const pkg = await Bun.file(join(project, 'package.json')).json();
  const paths: Record<string, string[]> = {};
  for (const [key, entry] of Object.entries(pkg.exports)) {
    if (
      typeof entry === 'object' &&
      entry !== null &&
      'import' in entry &&
      typeof entry.import === 'string'
    )
      paths[`@kongmy-dev/sapphire-ui/${key.slice(2)}`] = [
        join(project, entry.import.replace('./dist/', '')),
      ];
  }
  const files = readExamples(project).map((row) => {
    const file = join(root, `${row.component}-${row.name}.tsx`);
    writeFileSync(file, exampleSource(project, row));
    return file;
  });
  const options = ts.convertCompilerOptionsFromJson(
    {
      ...JSON.parse(await Bun.file(join(project, 'tsconfig.base.json')).text())
        .compilerOptions,
      paths,
      typeRoots: [join(project, 'node_modules/@types')],
      types: ['react', 'react-dom'],
    },
    project,
  ).options;
  const host = ts.createCompilerHost(options);
  host.resolveModuleNames = (names, containingFile) =>
    names.map(
      (name) =>
        ts.resolveModuleName(
          name,
          containingFile.startsWith(root)
            ? join(project, 'site/usage.tsx')
            : containingFile,
          options,
          host,
        ).resolvedModule,
    );
  const program = ts.createProgram(files, options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  expect(
    diagnostics.map((item) =>
      ts.flattenDiagnosticMessageText(item.messageText, '\n'),
    ),
  ).toEqual([]);
}, 30000);

test('usage includes demo CSS and dependencies alongside the selected source', () => {
  const project = process.cwd();
  const file = 'components/button/button.examples.tsx';
  const icons = exampleUsage(
    project,
    { component: 'button', file, name: 'icons' },
    false,
  );
  expect(icons).toContain(
    'bun add @kongmy-dev/sapphire-ui react react-dom lucide-react',
  );
  const dark = exampleUsage(
    project,
    { component: 'button', file, name: 'on-dark' },
    false,
  );
  expect(dark).toContain('Example CSS');
  expect(dark).toContain('.sp-button-demo-dark');
  expect(dark).toContain('background: var(--brand-navy)');
});

test('private sibling example helpers are recursively inlined without fake package paths', () => {
  const directory = join(root, 'components/workspace');
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    join(directory, 'workspace.examples.tsx'),
    `import { useState } from 'react'; import { Panel as WorkspacePanel } from './workspace-panel.examples.js'; function Workspace() { const [name] = useState('Example'); return <WorkspacePanel title={name} />; } export const examples = [{name:'workspace',render:Workspace}] as const;`,
  );
  writeFileSync(
    join(directory, 'workspace-panel.examples.tsx'),
    `import { useState, type ReactNode } from 'react'; import { Button } from './workspace.js'; import { initial } from './workspace-data.examples.js'; export function Panel({title}:{title:ReactNode}) { const [value] = useState(initial); return <Button>{title}{value}</Button>; } export function Unrelated() { return <p>unrelated private helper</p>; }`,
  );
  writeFileSync(
    join(directory, 'workspace-data.examples.ts'),
    `export const initial = 'Ready';`,
  );
  writeFileSync(
    join(directory, 'workspace.tsx'),
    `export function Button() { return <button>Public runtime</button>; }`,
  );
  const source = exampleSource(root, {
    component: 'workspace',
    file: 'components/workspace/workspace.examples.tsx',
    name: 'workspace',
  });
  expect(source).toContain('function Panel');
  expect(source).toContain("initial = 'Ready'");
  expect(source).toContain('const WorkspacePanel = Panel');
  expect(source).toContain('@kongmy-dev/sapphire-ui/workspace');
  expect(source).not.toContain('examples-panel');
  expect(source).not.toContain('examples-data');
  expect(source).not.toContain('Public runtime');
  expect(source).not.toContain('unrelated private helper');
  expect(source.match(/useState.*from/g)).toHaveLength(1);
});

test('private helper expansion rejects unsupported namespace imports', () => {
  const directory = join(root, 'components/workspace');
  writeFileSync(
    join(directory, 'workspace.namespace.tsx'),
    `import * as Helpers from './workspace-data.examples.js'; function Example() { return <p>{Helpers.initial}</p>; } export const examples = [{name:'namespace',render:Example}] as const;`,
  );
  expect(() =>
    exampleSource(root, {
      component: 'workspace',
      file: 'components/workspace/workspace.namespace.tsx',
      name: 'namespace',
    }),
  ).toThrow('require named imports');
});
