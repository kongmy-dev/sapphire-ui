import { describe, expect, it } from 'bun:test';
import { checkA11yCoverage } from './a11y-coverage';

describe('a11y coverage gate', () => {
  it('passes on current repository structure', () => {
    const violations = checkA11yCoverage(process.cwd());
    expect(violations).toEqual([]);
  });
});
