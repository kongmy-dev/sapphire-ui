export const STATE_INVENTORY_FILE = 'tests/visual/state-inventory.json';
export const STATE_COUNT_ANNOTATION = 'v4-state-count';
export type StateInventory = Readonly<Record<string, number>>;

export const stateName = (title: string) =>
  title.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();

export function inventoryOf(paths: readonly string[]): StateInventory {
  const indices = new Map<string, Set<number>>();
  for (const path of paths) {
    const match =
      /^tests\/visual\/pins\/states\/([^/]+)\/(\d+)\.([^/.]+)\.png$/.exec(path);
    if (match === null) throw new Error(`invalid state pin: ${path}`);
    const [, name, index, project] = match;
    const key = `${name}/${project}`;
    const found = indices.get(key) ?? new Set<number>();
    found.add(Number(index));
    indices.set(key, found);
  }
  return Object.fromEntries(
    [...indices]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, found]) => {
        if (Math.max(...found) !== found.size - 1)
          throw new Error(`noncontiguous state pins: ${key}`);
        return [key, found.size];
      }),
  );
}

export function captureCountProblem(input: {
  readonly expected: number;
  readonly captured: number;
  readonly updating: boolean;
}): string | null {
  const { expected, captured, updating } = input;
  if (captured < expected)
    return `missing state captures: expected ${expected}, captured ${captured}`;
  if (captured > expected && !updating)
    return `new state captures require bun run pin: expected ${expected}, captured ${captured}`;
  return null;
}

function countAnnotation(
  value: Record<string, unknown>,
): [string, number] | null {
  if (value.type !== STATE_COUNT_ANNOTATION) return null;
  if (typeof value.description !== 'string')
    throw new Error('invalid state count annotation');
  const match = /^([^/]+\/[^/]+)=(\d+)$/.exec(value.description);
  const key = match?.[1];
  const count = Number(match?.[2]);
  if (key === undefined || !Number.isSafeInteger(count))
    throw new Error('invalid state count annotation');
  return [key, count];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function reportedCounts(value: unknown): [string, number][] {
  if (Array.isArray(value)) return value.flatMap(reportedCounts);
  if (!isRecord(value)) return [];
  const count = countAnnotation(value);
  if (count !== null) return [count];
  return Object.values(value).flatMap(reportedCounts);
}

export function updatedInventory(
  current: StateInventory,
  report: unknown,
): StateInventory {
  const next = { ...current };
  for (const [key, count] of reportedCounts(report)) {
    if (count < (next[key] ?? 0))
      throw new Error(`missing state captures: ${key}`);
    if (count > 0) next[key] = count;
  }
  return Object.fromEntries(
    Object.entries(next).sort(([left], [right]) => left.localeCompare(right)),
  );
}
