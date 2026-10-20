'use client';

import { useState } from 'react';
import { Button } from '../button/button.js';
import { CookieBanner } from './cookie-banner.js';

function CookiePreferences() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Cookie preferences</Button>
      <CookieBanner forceShow={open} onClose={() => setOpen(false)} />
    </>
  );
}

export const examples = [
  { name: 'preferences', render: CookiePreferences },
] as const;
