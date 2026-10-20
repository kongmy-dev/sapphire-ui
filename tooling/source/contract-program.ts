import { resolve } from 'node:path';
import ts from 'typescript';
import type { FileText } from '../gates/scope';

export function contractProgram(input: {
  root: string;
  files: readonly FileText[];
}): ts.Program {
  const options: ts.CompilerOptions = {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.Preserve,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
  };
  const content = new Map(
    input.files.map((file) => [resolve(input.root, file.name), file.text]),
  );
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile;
  host.readFile = (file) => content.get(file) ?? readFile(file);
  const exists = host.fileExists;
  host.fileExists = (file) => content.has(file) || exists(file);
  host.getSourceFile = (file, languageVersion) => {
    const text = host.readFile(file);
    return text === undefined
      ? undefined
      : ts.createSourceFile(file, text, languageVersion, true);
  };
  return ts.createProgram({ rootNames: [...content.keys()], options, host });
}
