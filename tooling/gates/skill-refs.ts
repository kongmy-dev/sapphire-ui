import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { finish, type GateResult, type Violation } from './report.js';
import { type FileText, loadFiles } from './scope.js';

function referencedPaths(text: string) {
  return [...text.matchAll(/`([^`\n]+)`|\]\(([^)\n]+)\)/g)].flatMap((match) => {
    const value = match[1] ?? match[2] ?? '';
    if (/\s|[<>*{}]|^[#@~]|:\/\//.test(value)) return [];
    if (/^\.[a-z.]+$/.test(value)) return [];
    if (!value.includes('/') && !/\.(?:md|tsx?|css|json|sh)$/.test(value))
      return [];
    return [{ path: value.replace(/#.*$/, ''), offset: match.index }];
  });
}

function fileReferences(
  root: string,
  file: FileText,
  exists: (path: string) => boolean,
): Violation[] {
  return referencedPaths(file.text).flatMap((reference) => {
    if (
      exists(resolve(root, reference.path)) ||
      exists(resolve(root, dirname(file.name), reference.path))
    )
      return [];
    return [
      {
        file: file.name,
        line: file.text.slice(0, reference.offset).split('\n').length,
        rule: 'P-11',
        problem: `Skill references missing path ${reference.path}`,
        fix: 'Link the current repository path, or remove the stale reference.',
      },
    ];
  });
}

export function skillRefsGate(
  root: string,
  files: readonly FileText[],
  exists: (path: string) => boolean = existsSync,
): GateResult {
  const skills = files.filter((file) => /(^|\/)skills\//.test(file.name));
  const violations: Violation[] = [];
  for (const file of skills)
    violations.push(...fileReferences(root, file, exists));
  return { name: 'skill-refs', files: skills.length, violations };
}

if (import.meta.main)
  finish(
    skillRefsGate(
      process.cwd(),
      loadFiles(process.cwd(), process.argv.slice(2), ['.md']),
    ),
  );
