'use client';

import { useId, useState } from 'react';
import { Button } from '../button/button.js';
import { PassphraseGate } from './passphrase-gate.js';

function PassphraseDocument() {
  const id = useId();
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState('');
  return (
    <>
      <PassphraseGate
        isHidden={hidden}
        brandMark="S"
        brandName="Sapphire"
        documentTitle="Cloud migration"
        description="Use the demonstration passphrase: demo."
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get('passphrase');
            if (value === 'demo') {
              setError('');
              setHidden(true);
            } else setError('Incorrect passphrase. Try demo.');
          }}
        >
          <label className="sp-passphrase-gate-label" htmlFor={id}>
            Passphrase
          </label>
          <div className="sp-passphrase-gate-field">
            <input
              id={id}
              name="passphrase"
              type="password"
              className="sp-passphrase-gate-input"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <button className="sp-passphrase-gate-submit" type="submit">
              Unlock
            </button>
          </div>
          {error && (
            <p
              id={`${id}-error`}
              className="sp-passphrase-gate-error"
              role="alert"
            >
              {error}
            </p>
          )}
        </form>
      </PassphraseGate>
      {hidden && (
        <div>
          <p>Document unlocked.</p>
          <Button onClick={() => setHidden(false)}>Lock document</Button>
        </div>
      )}
    </>
  );
}

export const examples = [
  { name: 'document', render: PassphraseDocument },
] as const;
