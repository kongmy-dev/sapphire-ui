import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins plain class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy / conditional inputs', () => {
    expect(cn('a', false, null, undefined, 0 as unknown as string, 'b')).toBe(
      'a b',
    );
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('flattens arrays of class values', () => {
    expect(cn(['a', 'b'], ['c'])).toBe('a b c');
  });

  it('resolves conflicting Tailwind utilities — later class wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('text-lg text-sm')).toBe('text-sm');
  });

  it('lets a consumer className override a base class', () => {
    expect(cn('rounded-md bg-card p-4', 'p-2')).toBe('rounded-md bg-card p-2');
  });

  it('returns an empty string for no meaningful input', () => {
    expect(cn()).toBe('');
    expect(cn(false, null, undefined)).toBe('');
  });
});
