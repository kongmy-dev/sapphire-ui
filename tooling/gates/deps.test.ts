import { describe, expect, it } from 'bun:test';
import { dependencyGate } from './deps';
import { renderReport } from './report';

const TYPESCRIPT_OK = '    "typescript": "6.0.3"';

const packageJson = (sections: Record<string, string[]>, head: string[] = []) =>
  [
    '{',
    ...head,
    ...Object.entries(sections).flatMap(([name, entries]) => [
      `  "${name}": {`,
      ...entries,
      '  },',
    ]),
    '  "private": true',
    '}',
    '',
  ].join('\n');

const found = (packageText: string, bunVersionText: string | null = '1.4.3') =>
  dependencyGate({ packageText, bunVersionText }).violations.map(
    (v) => `${v.file}:${v.line} ${v.problem}`,
  );

const GOOD_HEAD = ['  "packageManager": "bun@1.4.3",'];

describe('dependency gate: exact toolchain pins', () => {
  it('flags the caret and partial devDependencies the package once had', () => {
    const text = [
      '{',
      '  "devDependencies": {',
      '    "@axe-core/playwright": "^4.12.1",',
      '    "@biomejs/biome": "^2.5.3",',
      '    "jsdom": "^29.1.1",',
      '    "react-day-picker": "10",',
      '    "typescript": "6",',
      '    "vitest": "^4.1.11"',
      '  }',
      '}',
      '',
    ].join('\n');
    expect(found(text)).toEqual([
      'package.json:1 react and react-dom are not both declared in peerDependencies',
      'package.json:3 @axe-core/playwright is "^4.12.1", not an exact version',
      'package.json:4 @biomejs/biome is "^2.5.3", not an exact version',
      'package.json:5 jsdom is "^29.1.1", not an exact version',
      'package.json:6 react-day-picker is "10", not an exact version',
      'package.json:7 typescript is "6", not an exact version',
      'package.json:8 vitest is "^4.1.11", not an exact version',
      'package.json:1 packageManager is missing or not bun@x.y.z',
    ]);
  });

  it.each(['~1.2.3', '*', 'x', '1.x', '>=1.2.3', 'latest', 'next', '^1.2.3'])(
    'flags the devDependency range %s',
    (range) => {
      const text = packageJson(
        {
          peerDependencies: [
            '    "react": "^19.0.0",',
            '    "react-dom": "^19.0.0"',
          ],
          devDependencies: [`    "left-pad": "${range}",`, TYPESCRIPT_OK],
        },
        GOOD_HEAD,
      );
      expect(found(text)).toEqual([
        `package.json:8 left-pad is "${range}", not an exact version`,
      ]);
    },
  );

  it('passes exact versions, including a prerelease', () => {
    const text = packageJson(
      {
        peerDependencies: [
          '    "react": "^19.0.0",',
          '    "react-dom": "^19.0.0"',
        ],
        devDependencies: ['    "left-pad": "1.3.0-rc.1",', TYPESCRIPT_OK],
      },
      GOOD_HEAD,
    );
    expect(found(text)).toEqual([]);
  });

  it('flags TypeScript outside 6.0.x and a missing TypeScript', () => {
    const peers = ['    "react": "^19.0.0",', '    "react-dom": "^19.0.0"'];
    const seven = packageJson(
      {
        peerDependencies: peers,
        devDependencies: ['    "typescript": "7.0.0"'],
      },
      GOOD_HEAD,
    );
    const none = packageJson(
      { peerDependencies: peers, devDependencies: ['    "vite": "8.3.4"'] },
      GOOD_HEAD,
    );
    expect(found(seven)).toEqual([
      'package.json:8 typescript is 7.0.0, not 6.0.x',
    ]);
    expect(found(none)).toEqual([
      'package.json:7 typescript is not in devDependencies',
    ]);
  });
});

describe('dependency gate: Bun is pinned in two places that agree', () => {
  const text = packageJson(
    {
      peerDependencies: [
        '    "react": "^19.0.0",',
        '    "react-dom": "^19.0.0"',
      ],
      devDependencies: [TYPESCRIPT_OK],
    },
    GOOD_HEAD,
  );

  it('flags a missing .bun-version', () => {
    expect(found(text, null)).toEqual([
      '.bun-version:1 .bun-version is missing',
    ]);
  });

  it('flags a .bun-version that differs from packageManager', () => {
    expect(found(text, '1.4.2\n')).toEqual([
      '.bun-version:1 .bun-version is 1.4.2, packageManager says 1.4.3',
    ]);
  });

  it('passes when both agree, with or without a trailing newline', () => {
    expect(found(text, '1.4.3\n')).toEqual([]);
    expect(found(text, '1.4.3')).toEqual([]);
  });

  it('flags a packageManager that is not bun@x.y.z', () => {
    const npm = text.replace('bun@1.4.3', 'npm@10.0.0');
    expect(found(npm)).toEqual([
      'package.json:2 packageManager is missing or not bun@x.y.z',
    ]);
  });
});

describe('dependency gate: peers stay peers', () => {
  const tail = {
    devDependencies: [TYPESCRIPT_OK],
  };

  it('flags a Radix or React package in dependencies', () => {
    const text = packageJson(
      {
        dependencies: [
          '    "@radix-ui/react-slot": "^1.0.0",',
          '    "react": "^19.0.0"',
        ],
        peerDependencies: ['    "react-dom": "^19.0.0"'],
        ...tail,
      },
      GOOD_HEAD,
    );
    expect(found(text)).toEqual([
      'package.json:4 @radix-ui/react-slot is in dependencies',
      'package.json:5 react is in dependencies',
      'package.json:7 react and react-dom are not both declared in peerDependencies',
    ]);
  });

  it('flags react-resizable-panels when it is not marked optional', () => {
    const text = packageJson(
      {
        peerDependencies: [
          '    "react": "^19.0.0",',
          '    "react-dom": "^19.0.0",',
          '    "react-resizable-panels": "^4.0.0"',
        ],
        ...tail,
      },
      GOOD_HEAD,
    );
    expect(found(text)).toEqual([
      'package.json:6 react-resizable-panels is a peer that is not marked optional',
    ]);
  });

  it('passes react-resizable-panels marked optional', () => {
    const text = packageJson(
      {
        peerDependencies: [
          '    "react": "^19.0.0",',
          '    "react-dom": "^19.0.0",',
          '    "react-resizable-panels": "^4.0.0"',
        ],
        peerDependenciesMeta: [
          '    "react-resizable-panels": { "optional": true }',
        ],
        ...tail,
      },
      GOOD_HEAD,
    );
    expect(found(text)).toEqual([]);
  });
});

describe('dependency gate: a gate that checked nothing fails', () => {
  it('fails with no package.json', () => {
    expect(
      renderReport(dependencyGate({ packageText: null, bunVersionText: null }))
        .text,
    ).toBe(
      [
        'dependency gate: 0 files checked',
        '  package.json:1  P-12  package.json is missing',
        '    Run the gate from the repository root.',
        'dependency gate: FAIL — nothing was measured',
      ].join('\n'),
    );
  });

  it('flags a package.json that does not parse', () => {
    expect(found('{ "devDependencies": ')).toEqual([
      'package.json:1 package.json is not valid JSON of the expected shape',
    ]);
  });

  it('prints how many devDependencies and peers it checked', () => {
    const text = packageJson(
      {
        peerDependencies: [
          '    "react": "^19.0.0",',
          '    "react-dom": "^19.0.0"',
        ],
        devDependencies: ['    "left-pad": "1.3.0",', TYPESCRIPT_OK],
      },
      GOOD_HEAD,
    );
    expect(
      renderReport(
        dependencyGate({ packageText: text, bunVersionText: '1.4.3' }),
      ),
    ).toEqual({
      ok: true,
      text: 'dependency gate: 2 files checked (2 devDependencies, 2 peers)\ndependency gate: OK',
    });
  });
});
