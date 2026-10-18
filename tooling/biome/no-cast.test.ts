import { afterAll, describe, expect, it } from 'bun:test';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repo = join(import.meta.dir, '../..');
const dir = mkdtempSync(join(tmpdir(), 'sapphire-no-cast-'));

writeFileSync(
  join(dir, 'biome.json'),
  JSON.stringify({
    plugins: [join(import.meta.dir, 'no-cast.grit')],
    linter: { enabled: true, rules: { preset: 'none' } },
    formatter: { enabled: false },
  }),
);

afterAll(() => rmSync(dir, { recursive: true, force: true }));

const castLines = (name: string, source: string) => {
  writeFileSync(join(dir, name), source);
  const run = Bun.spawnSync(
    [join(repo, 'node_modules/.bin/biome'), 'lint', '--colors=off', name],
    { cwd: dir },
  );
  const output = `${run.stdout.toString()}${run.stderr.toString()}`;
  return [
    ...output.matchAll(new RegExp(`${name}:(\\d+):\\d+ plugin`, 'g')),
  ].map((match) => Number(match[1]));
};

describe('no-cast plugin (P-3)', () => {
  it('flags an as cast, a double cast and an angle-bracket cast', () => {
    const source = [
      "const a = JSON.parse('[]') as string[];",
      "const b = JSON.parse('1') as unknown as number;",
      "const c = <number>JSON.parse('1');",
      'export { a, b, c };',
    ].join('\n');
    expect(castLines('casts.ts', source)).toEqual([1, 2, 2, 3]);
  });

  it('allows as const, and flags a type whose name only starts with const', () => {
    const source = [
      'type Constant = number;',
      "const a = ['x', 'y'] as const;",
      "const b = JSON.parse('1') as Constant;",
      'export { a, b };',
    ].join('\n');
    expect(castLines('const.ts', source)).toEqual([3]);
  });
});
