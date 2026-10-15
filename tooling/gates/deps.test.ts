import { describe, expect, it } from 'vitest';
import { validateDependencies } from './deps';

describe('dependency gate: peer & dependency validation', () => {
  it('passes on valid package configuration', () => {
    const validPkg = {
      dependencies: {
        'class-variance-authority': '^0.7.1',
        clsx: '^2.1.1',
      },
      peerDependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'react-resizable-panels': '^4.0.0',
        '@radix-ui/react-dialog': '^1.0.0',
      },
      peerDependenciesMeta: {
        'react-resizable-panels': {
          optional: true,
        },
      },
    };
    expect(validateDependencies(validPkg)).toEqual([]);
  });

  it('fails if a peer dependency is placed into runtime dependencies', () => {
    const invalidPkg = {
      dependencies: {
        '@radix-ui/react-slot': '^1.0.0',
        react: '^19.0.0',
      },
      peerDependencies: {
        'react-dom': '^19.0.0',
      },
    };
    const violations = validateDependencies(invalidPkg);
    expect(violations.length).toBeGreaterThanOrEqual(2);
    expect(violations.some((v) => v.pkg === '@radix-ui/react-slot')).toBe(true);
    expect(violations.some((v) => v.pkg === 'react')).toBe(true);
  });

  it('fails if react-resizable-panels is missing from peerDependenciesMeta', () => {
    const pkgWithoutMeta = {
      dependencies: {},
      peerDependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        'react-resizable-panels': '^4.0.0',
      },
    };
    const violations = validateDependencies(pkgWithoutMeta);
    expect(violations.some((v) => v.pkg === 'react-resizable-panels')).toBe(true);
  });
});
