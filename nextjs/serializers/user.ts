import type { users } from '@prisma/client';

export interface SerializedUser {
  id: string;
  externalUserId: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
}

export default function serialize(user: users) {
  return {
    id: user.id,
    externalUserId: user.externalUserId,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
  };
}
