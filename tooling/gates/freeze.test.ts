import { describe, expect, it } from 'bun:test';
import { freezeGate } from './freeze';
import { renderReport } from './report';

const FROZEN_TREE = '87b6f4e71a290445f7df203d7223ba8a179cff1c';
const FIX = 'A v3 fix goes to the v3 branch; v4 work goes in the new folders.';

const clean = { treeHash: FROZEN_TREE, statusLines: [], fileCount: 106 };

describe('freeze gate: src/ does not change before P9', () => {
  it('passes the frozen tree with a clean status and prints the hash and count', () => {
    expect(renderReport(freezeGate(clean))).toEqual({
      ok: true,
      text: `freeze gate: 106 files checked (src tree ${FROZEN_TREE})\nfreeze gate: OK`,
    });
  });

  it('names an edited file and says where the change belongs', () => {
    const report = renderReport(
      freezeGate({
        ...clean,
        statusLines: [' M src/components/ui/Button.tsx'],
      }),
    );
    expect(report.ok).toBe(false);
    expect(report.text.split('\n').slice(1, 3)).toEqual([
      '  src/components/ui/Button.tsx:1  P-17  src/ is frozen, and this file is modified',
      `    ${FIX}`,
    ]);
  });

  it.each([
    ['A  src/components/ui/Dock.tsx', 'src/components/ui/Dock.tsx', 'added'],
    [
      '?? src/components/ui/Dock.tsx',
      'src/components/ui/Dock.tsx',
      'untracked',
    ],
    [' D src/lib/utils.ts', 'src/lib/utils.ts', 'deleted'],
    ['MM src/lib/theme.ts', 'src/lib/theme.ts', 'modified'],
    ['?? "src/with space.ts"', 'src/with space.ts', 'untracked'],
  ])('reports the status line %s', (line, file, state) => {
    expect(
      freezeGate({ ...clean, statusLines: [line] }).violations.map(
        (v) => `${v.file} ${v.problem}`,
      ),
    ).toEqual([`${file} src/ is frozen, and this file is ${state}`]);
  });

  it('names both paths of a rename', () => {
    const files = freezeGate({
      ...clean,
      statusLines: ['R  src/lib/a.ts -> src/lib/b.ts'],
    }).violations.map((v) => v.file);
    expect(files).toEqual(['src/lib/a.ts', 'src/lib/b.ts']);
  });

  it('fails when the committed src/ tree differs from the frozen one', () => {
    const report = renderReport(
      freezeGate({ ...clean, treeHash: 'a'.repeat(40) }),
    );
    expect(report.ok).toBe(false);
    expect(report.text.split('\n').slice(1, 3)).toEqual([
      `  src:1  P-17  src/ tree is ${'a'.repeat(40)}, not the frozen ${FROZEN_TREE}`,
      `    ${FIX} git diff --stat ${FROZEN_TREE} HEAD:src lists what changed.`,
    ]);
  });

  it('fails when the tree cannot be read', () => {
    const { violations } = freezeGate({ ...clean, treeHash: '' });
    expect(violations.map((v) => v.problem)).toEqual([
      `src/ tree is unreadable, not the frozen ${FROZEN_TREE}`,
    ]);
  });
});

describe('freeze gate: a gate that checked nothing fails', () => {
  it('fails when no file under src/ was counted', () => {
    expect(renderReport(freezeGate({ ...clean, fileCount: 0 })).text).toBe(
      `freeze gate: 0 files checked (src tree ${FROZEN_TREE})\nfreeze gate: FAIL — nothing was measured`,
    );
  });
});
