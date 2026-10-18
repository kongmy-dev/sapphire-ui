import { describe, expect, it } from 'bun:test';
import { findHexColors } from './tokens';

describe('token gate: hardcoded hex detection', () => {
  it('detects 6-digit hex color in className string', () => {
    const code = `export const C = () => <div className="bg-[#0a192f]" />;`;
    const violations = findHexColors('Component.tsx', code);
    expect(violations).toEqual([
      { file: 'Component.tsx', line: 1, hex: '#0a192f' },
    ]);
  });

  it('detects 3-digit hex color', () => {
    const code = `export const C = () => <div className="text-[#fff]" />;`;
    const violations = findHexColors('Component.tsx', code);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.hex).toBe('#fff');
  });

  it('detects hex color inside template literals', () => {
    const code = 'const color = `#123456`;';
    const violations = findHexColors('Component.tsx', code);
    expect(violations).toHaveLength(1);
    expect(violations[0]?.hex).toBe('#123456');
  });

  it('ignores token variables and anchor hashes', () => {
    const code = `
export const C = () => (
  <div className="bg-primary text-foreground">
    <a href="#features">Features</a>
  </div>
);
`;
    const violations = findHexColors('Component.tsx', code);
    expect(violations).toEqual([]);
  });
});
