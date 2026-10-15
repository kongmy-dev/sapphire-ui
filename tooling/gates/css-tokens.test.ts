import { describe, expect, it } from 'vitest';
import { checkComponentCssVariables, getDeclaredCssVariables } from './css-tokens';

describe('css tokens gate', () => {
  it('extracts theme tokens successfully', () => {
    const vars = getDeclaredCssVariables(process.cwd());
    expect(vars.has('--color-primary')).toBe(true);
    expect(vars.has('--color-accent')).toBe(true);
    expect(vars.has('--color-accent-text')).toBe(true);
  });

  it('verifies that all variables used in components exist in theme', () => {
    const violations = checkComponentCssVariables(process.cwd());
    expect(violations).toEqual([]);
  });
});
