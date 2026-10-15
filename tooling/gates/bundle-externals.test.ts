import { describe, expect, it } from 'vitest';
import { checkBundleExternals } from './bundle-externals';

describe('bundle externals gate', () => {
  it('passes when dist/node_modules does not exist', () => {
    expect(checkBundleExternals(process.cwd())).toEqual([]);
  });
});
