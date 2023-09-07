import { SerializedUser } from '@linen/types';

export function getDisplayName(userId: string, mentions?: SerializedUser[]) {
  if (!mentions) {
    return 'User';
  }
  return userId === 'channel'
    ? userId
    : mentions.find(
        (user) => user.id === userId || user.externalUserId === userId
      )?.displayName || 'User';
}
