import { Avatar } from '../avatar/avatar.js';
import { AvatarGroup } from './avatar-group.js';

function AvatarGroupMembers() {
  return (
    <AvatarGroup aria-label="Project members">
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
    </AvatarGroup>
  );
}

function AvatarGroupOverflow() {
  return (
    <AvatarGroup max={2} spacing={12} aria-label="Project contributors">
      <Avatar fallback="AB" />
      <Avatar fallback="CD" />
      <Avatar fallback="EF" />
      <Avatar fallback="GH" />
    </AvatarGroup>
  );
}

export const examples = [
  { name: 'members', render: AvatarGroupMembers },
  { name: 'overflow', render: AvatarGroupOverflow },
] as const;
