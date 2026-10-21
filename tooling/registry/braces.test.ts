import { expect, it } from 'bun:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.resolve('shadcn'));

function check(source: string) {
  const program = `const assert = require('node:assert/strict');
const braces = require(${JSON.stringify(require.resolve('braces'))});
${source}`;
  const result = Bun.spawnSync([process.execPath, '--eval', program], {
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 10000,
  });
  expect(result.stderr.toString()).toBe('');
  expect(result.exitCode).toBe(0);
}

it('rejects deeply nested patterns before recursive walkers exhaust the stack', () => {
  check(`
for (const [open, close] of [['{', '}'], ['(', ')'], ['{(', ')}']]) {
  const levels = Math.floor(4000 / open.length);
  const pattern = open.repeat(levels) + 'a,b' + close.repeat(levels);
  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    assert.throws(() => braces[method](pattern), {name: 'SyntaxError', message: /maximum depth/});
  }
}
`);
});

it('bounds recursive walkers when callers supply an AST directly', () => {
  check(`
for (const method of ['compile', 'expand', 'stringify']) {
  let ast = {type: 'text', value: 'leaf', nodes: []};
  for (let i = 0; i < 16000; i++) ast = {type: 'root', nodes: [ast]};
  assert.throws(() => braces[method](ast), {name: 'SyntaxError', message: /maximum depth/});
}
`);
});

it('preserves normal expansion, quoting, escaping and non-nested long patterns', () => {
  check(`
assert.deepEqual(braces.expand('src/{components,blocks}/**/*.{ts,tsx}'), [
  'src/components/**/*.ts', 'src/components/**/*.tsx', 'src/blocks/**/*.ts', 'src/blocks/**/*.tsx'
]);
assert.deepEqual(braces.expand('file-{1..3}'), ['file-1', 'file-2', 'file-3']);
assert.deepEqual(braces.expand('"{a,b}"'), ['{a,b}']);
assert.deepEqual(braces.expand(String.raw\`\\{a,b\\}\`), ['{a,b}']);
const nested = '{'.repeat(120) + 'a,b' + '}'.repeat(120);
assert.equal(typeof braces.compile(nested), 'string');
assert.equal(typeof braces.stringify(nested), 'string');
assert.equal(braces.expand(nested).length, 2);
const literal = 'x'.repeat(9000);
assert.equal(braces.compile(literal), literal);
const match = require(${JSON.stringify(require.resolve('micromatch'))});
assert.deepEqual(match(['src/a.ts', 'src/b.tsx', 'test/a.ts'], 'src/*.{ts,tsx}'), ['src/a.ts', 'src/b.tsx']);
`);
});
