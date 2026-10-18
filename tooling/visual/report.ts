import { join } from 'node:path';
import { CONTAINER_ROOT } from './container';

const IMAGE_KINDS = ['expected', 'actual', 'diff'] as const;

type ImageKind = (typeof IMAGE_KINDS)[number];

export type Failure = {
  example: string;
  scheme: string;
  images: Partial<Record<ImageKind, string>>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const listOf = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

const kindOf = (name: string): ImageKind | null =>
  IMAGE_KINDS.find((kind) => name.endsWith(`-${kind}.png`)) ?? null;

const entryOf = (attachment: unknown): [ImageKind, string][] => {
  if (!isRecord(attachment)) return [];
  const { name, path } = attachment;
  const kind = typeof name === 'string' ? kindOf(name) : null;
  return kind !== null && typeof path === 'string' ? [[kind, path]] : [];
};

const imagesOf = (attachments: readonly unknown[]): Failure['images'] =>
  Object.fromEntries(attachments.flatMap(entryOf));

function failureOf(example: string, test: unknown): Failure[] {
  if (!isRecord(test) || test.status !== 'unexpected') return [];
  if (typeof test.projectName !== 'string') return [];
  const attachments = listOf(test.results).flatMap((result) =>
    isRecord(result) ? listOf(result.attachments) : [],
  );
  return [{ example, scheme: test.projectName, images: imagesOf(attachments) }];
}

const failuresOfSpec = (spec: unknown): Failure[] =>
  isRecord(spec) && typeof spec.title === 'string'
    ? listOf(spec.tests).flatMap((test) => failureOf(`${spec.title}`, test))
    : [];

const specsOf = (suite: unknown): unknown[] =>
  isRecord(suite)
    ? [...listOf(suite.specs), ...listOf(suite.suites).flatMap(specsOf)]
    : [];

export const parseFailures = (report: unknown): Failure[] =>
  specsOf({ suites: isRecord(report) ? report.suites : [] }).flatMap(
    failuresOfSpec,
  );

const toHostPath = (path: string, root: string): string =>
  path.startsWith(`${CONTAINER_ROOT}/`)
    ? join(root, path.slice(CONTAINER_ROOT.length + 1))
    : path;

const pinPath = (failure: Failure): string => {
  const [route, slug] = failure.example.split('/');
  return `tests/visual/pins/${route}/${slug}.${failure.scheme}.png`;
};

export function describeFailure(failure: Failure, root: string): string[] {
  const heading = `${failure.example} [${failure.scheme}]`;
  const shown = IMAGE_KINDS.flatMap((kind) => {
    const path = failure.images[kind];
    return path === undefined ? [] : [`    ${kind}: ${toHostPath(path, root)}`];
  });
  if (shown.length > 0) return [`  ${heading} differs`, ...shown];
  return [`  ${heading} has no pin yet: ${pinPath(failure)}`];
}
