/* eslint-disable better-tailwindcss/no-conflicting-classes, better-tailwindcss/enforce-consistent-class-order --
   This suite intentionally passes conflicting / unordered utility strings to
   verify that cn() (clsx + tailwind-merge) resolves them correctly. */
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('joins plain class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('drops falsy / conditional inputs', () => {
    expect(cn('a', false, null, undefined, 0 as unknown as string, 'b')).toBe('a b');
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('flattens arrays of class values', () => {
    expect(cn(['a', 'b'], ['c'])).toBe('a b c');
  });

  it('resolves conflicting Tailwind utilities — later class wins', () => {
    // tailwind-merge collapses same-property utilities, keeping the last one.
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('p-4', 'px-2')).toBe('p-4 px-2');
    expect(cn('text-sm text-lg')).toBe('text-lg');
  });

  it('lets a consumer className override a base class', () => {
    // The canonical merge behaviour the design system relies on for overrides.
    expect(cn('rounded-md bg-card p-4', 'p-2')).toBe('rounded-md bg-card p-2');
  });

  it('returns an empty string for no meaningful input', () => {
    expect(cn()).toBe('');
    expect(cn(false, null, undefined)).toBe('');
  });
});
