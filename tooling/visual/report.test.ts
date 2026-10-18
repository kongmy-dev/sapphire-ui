import { describe, expect, it } from 'bun:test';
import { describeFailure, parseFailures } from './report';

const attachment = (name: string) => ({
  name,
  path: `/work/test-results/${name}`,
  contentType: 'image/png',
});

const failingTest = (projectName: string, names: readonly string[]) => ({
  projectName,
  status: 'unexpected',
  results: [{ attachments: names.map(attachment) }],
});

const report = {
  suites: [
    {
      title: 'pins.spec.ts',
      specs: [],
      suites: [
        {
          title: 'buttons',
          specs: [
            {
              title: 'buttons/variants',
              tests: [
                failingTest('light', [
                  'variants.light-expected.png',
                  'variants.light-actual.png',
                  'variants.light-diff.png',
                ]),
                { projectName: 'dark', status: 'expected', results: [] },
              ],
            },
            {
              title: 'buttons/sizes',
              tests: [failingTest('dark', [])],
            },
          ],
        },
      ],
    },
  ],
};

describe('parseFailures', () => {
  it('keeps only unexpected tests and their three images', () => {
    expect(parseFailures(report)).toEqual([
      {
        example: 'buttons/variants',
        scheme: 'light',
        images: {
          expected: '/work/test-results/variants.light-expected.png',
          actual: '/work/test-results/variants.light-actual.png',
          diff: '/work/test-results/variants.light-diff.png',
        },
      },
      { example: 'buttons/sizes', scheme: 'dark', images: {} },
    ]);
  });

  it('returns nothing for a report of another shape', () => {
    expect(parseFailures(null)).toEqual([]);
    expect(parseFailures({ suites: 'x' })).toEqual([]);
    expect(parseFailures({ suites: [{ specs: [{ tests: [1] }] }] })).toEqual(
      [],
    );
  });
});

describe('describeFailure', () => {
  it('prints host paths for the expected, actual and diff images', () => {
    const [failure] = parseFailures(report);
    if (failure === undefined) throw new Error('fixture has no failure');
    expect(describeFailure(failure, '/repo')).toEqual([
      '  buttons/variants [light] differs',
      '    expected: /repo/test-results/variants.light-expected.png',
      '    actual: /repo/test-results/variants.light-actual.png',
      '    diff: /repo/test-results/variants.light-diff.png',
    ]);
  });

  it('names the missing pin when no image was attached', () => {
    expect(
      describeFailure(
        { example: 'buttons/sizes', scheme: 'dark', images: {} },
        '/repo',
      ),
    ).toEqual([
      '  buttons/sizes [dark] has no pin yet: tests/visual/pins/buttons/sizes.dark.png',
    ]);
  });

  it('leaves a path outside the container untouched', () => {
    const lines = describeFailure(
      {
        example: 'cards/basic',
        scheme: 'light',
        images: { diff: '/elsewhere/diff.png' },
      },
      '/repo',
    );
    expect(lines[1]).toBe('    diff: /elsewhere/diff.png');
  });
});
