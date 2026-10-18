import { describe, expect, it } from 'bun:test';
import { checkBundleExternals } from './bundle-externals';

describe('bundle externals gate', () => {
  it('passes when dist/node_modules does not exist', () => {
    expect(checkBundleExternals(process.cwd())).toEqual([]);
  });
});
