import { describe, expect, it } from 'bun:test';
import { execFileSync } from 'node:child_process';
import inventory from '../../tests/visual/state-inventory.json' with {
  type: 'json',
};
import {
  captureCountProblem,
  inventoryOf,
  STATE_COUNT_ANNOTATION,
  stateName,
  updatedInventory,
} from './state-inventory';

const pin = (name: string, index: number, project = 'light') =>
  `tests/visual/pins/states/${name}/${index}.${project}.png`;
const annotation = (description: unknown) => ({
  type: STATE_COUNT_ANNOTATION,
  description,
});

describe('retained state inventory', () => {
  it('matches every tracked pin and ignores unrelated physical files', () => {
    const paths = execFileSync(
      'git',
      ['ls-files', 'tests/visual/pins/states'],
      { encoding: 'utf8', cwd: new URL('../..', import.meta.url) },
    )
      .trim()
      .split('\n');
    expect(paths.length).toBeGreaterThan(0);
    expect(inventoryOf(paths)).toEqual(inventory);
  });

  it('counts contiguous captures independently for each case and scheme', () => {
    expect(
      inventoryOf([
        pin('first', 1),
        pin('second', 0),
        pin('first', 0),
        pin('first', 0, 'dark'),
      ]),
    ).toEqual({ 'first/light': 2, 'first/dark': 1, 'second/light': 1 });
    expect(stateName('Data parity: Focus, narrow')).toBe(
      'data-parity-focus-narrow',
    );
    expect(() => inventoryOf([pin('gap', 0), pin('gap', 2)])).toThrow(
      'noncontiguous',
    );
    expect(() => inventoryOf(['unrelated.png'])).toThrow('invalid state pin');
  });

  it('rejects removed captures even while approving new appearance', () => {
    for (const updating of [false, true])
      expect(
        captureCountProblem({ expected: 3, captured: 2, updating }),
      ).toContain('missing state captures');
    expect(
      captureCountProblem({ expected: 3, captured: 3, updating: false }),
    ).toBeNull();
    expect(
      captureCountProblem({ expected: 0, captured: 0, updating: false }),
    ).toBeNull();
  });

  it('requires the pin workflow for additions and allows them during approval', () => {
    expect(
      captureCountProblem({ expected: 1, captured: 2, updating: false }),
    ).toContain('bun run pin');
    expect(
      captureCountProblem({ expected: 1, captured: 2, updating: true }),
    ).toBeNull();
  });

  it('records approved capture annotations without absorbing stale files or dropping other cases', () => {
    const current = { 'old/light': 2 };
    const report = {
      suites: [
        {
          specs: [
            {
              tests: [
                {
                  annotations: [annotation('new/dark=3')],
                  results: [
                    {
                      annotations: [
                        annotation('new/dark=3'),
                        annotation('empty/light=0'),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(updatedInventory(current, report)).toEqual({
      'old/light': 2,
      'new/dark': 3,
    });
    expect(current).toEqual({ 'old/light': 2 });
    expect(updatedInventory(current, null)).toEqual(current);
  });

  it('refuses malformed or shrinking report counts instead of orphaning pins', () => {
    expect(() =>
      updatedInventory({ 'old/light': 2 }, annotation('old/light=1')),
    ).toThrow('missing state captures');
    for (const value of [null, 'bad', 'new/light=9007199254740992'])
      expect(() => updatedInventory({}, annotation(value))).toThrow(
        'invalid state count',
      );
  });
});
