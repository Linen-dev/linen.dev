import type { users } from '@prisma/client';

export interface SerializedUser {
  id: string;
  username: string | null;
  displayName: string | null;
  externalUserId: string | null;
  profileImageUrl: string | null;
}

function username(displayName: string | null) {
  if (!displayName) {
    return null;
  }
  return displayName.toLowerCase().replace(/\s+/g, '.');
}

export default function serialize(user: users) {
  return {
    id: user.id,
    username: username(user.displayName),
    externalUserId: user.externalUserId,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
  };
}
