import type { users } from '@linen/database';
import type { Roles, SerializedUser } from '@linen/types';
import { tc } from '@linen/utilities/tc';

export function username(displayName: string | null) {
  if (!displayName) {
    return null;
  }
  return displayName.toLowerCase().replace(/\s+/g, '');
}

export function serializeUser(user: users): SerializedUser {
  return {
    id: user.id,
    authsId: user.authsId,
    username: username(user.displayName),
    externalUserId: user.externalUserId,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    anonymousAlias: user.anonymousAlias,
    role: user.role as Roles,
    search: tc(() => JSON.parse(user.searchSettings!)),
  };
}
