import { CodeBlock } from './code-block.js';

function CodeBlockCopy() {
  return <CodeBlock code="const answer = 42;" language="ts" copyable />;
}

function CodeBlockLight() {
  return (
    <CodeBlock
      variant="light"
      code="color: var(--foreground);"
      language="css"
    />
  );
}

export const examples = [
  { name: 'copy', render: CodeBlockCopy },
  { name: 'light', render: CodeBlockLight },
] as const;
