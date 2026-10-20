import { Analytics } from './analytics.js';

function ConsentExample() {
  return (
    <>
      <Analytics />
      <p>
        Analytics remains idle until consent is granted and a tracker is
        configured.
      </p>
    </>
  );
}

export const examples = [{ name: 'consent', render: ConsentExample }] as const;
