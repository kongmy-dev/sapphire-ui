import { readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { componentStylesheets } from '../css/stylesheet.js';
import { scanCss } from '../source/css.js';
import { packageEntries, packageSources } from './entries.js';

function declarations(root: string) {
  const config = ts.readConfigFile(
    join(root, 'tsconfig.package.json'),
    ts.sys.readFile,
  );
  if (config.error)
    throw new Error(
      ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
    );
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  const outdir = join(root, 'dist');
  const program = ts.createProgram(
    packageSources(root).map((file) => join(root, file)),
    { ...parsed.options, outDir: outdir, emitDeclarationOnly: true },
  );
  const files: Record<string, string> = {};
  const result = program.emit(undefined, (file, text) => {
    files[relative(outdir, file)] = text;
  });
  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...result.diagnostics,
  ];
  if (diagnostics.length)
    throw new Error(
      diagnostics
        .map((item) => ts.flattenDiagnosticMessageText(item.messageText, '\n'))
        .join('\n'),
    );
  return Object.fromEntries(
    Object.entries(files).sort(([a], [b]) => a.localeCompare(b)),
  );
}

function selectors(text: string) {
  return Array.from(scanCss(text).masked.matchAll(/([^{}]+)\{/g), (match) =>
    text.slice(match.index, match.index + (match[1]?.length ?? 0)).trim(),
  )
    .filter((selector) => !selector.startsWith('@'))
    .map((selector) => selector.replace(/\s+/g, ' '));
}

export function packageSurface(root: string) {
  const styles = [
    'css/tokens.css',
    'css/base.css',
    'css/layout.css',
    ...componentStylesheets(root),
  ].map((file) => readFileSync(join(root, file), 'utf8'));
  return JSON.stringify(
    {
      exports: packageEntries(root),
      declarations: declarations(root),
      selectors: [...new Set(styles.flatMap(selectors))].sort(),
      tokens: [
        ...new Set(
          styles.flatMap((text) =>
            Array.from(
              scanCss(text).masked.matchAll(/(--[\w-]+)\s*:/g),
              (match) => match[1],
            ),
          ),
        ),
      ].sort(),
    },
    null,
    2,
  );
}
