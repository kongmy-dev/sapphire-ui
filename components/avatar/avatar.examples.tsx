'use client';

import { useState } from 'react';
import { Avatar } from './avatar.js';

const portrait =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="8" r="5"/%3E%3Cpath d="M2 24a10 10 0 0 1 20 0"/%3E%3C/svg%3E';

function AvatarSizes() {
  return (
    <div className="sp-cluster">
      <Avatar size="xs" fallback="AB" />
      <Avatar size="sm" fallback="CD" />
      <Avatar fallback="EF" />
      <Avatar size="lg" fallback="GH" />
    </div>
  );
}

function AvatarLifecycle() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="sp-cluster">
      <Avatar
        size="lg"
        src={broken ? 'data:image/png;base64,invalid' : portrait}
        alt="Profile portrait"
        fallback="AP"
      />
      <button type="button" onClick={() => setBroken((current) => !current)}>
        {broken ? 'Restore portrait' : 'Break portrait'}
      </button>
    </div>
  );
}

export const examples = [
  { name: 'sizes', render: AvatarSizes },
  { name: 'lifecycle', render: AvatarLifecycle },
] as const;
