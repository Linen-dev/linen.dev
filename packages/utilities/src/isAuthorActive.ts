import { SerializedUser } from '@linen/types';

export function isAuthorActive(
  author: SerializedUser | null,
  currentUser: SerializedUser | null,
  activeUsers?: string[]
) {
  if (!author) {
    return false;
  }
  if (author.id === currentUser?.id) {
    return true;
  }
  if (author.authsId && activeUsers?.includes(author.authsId)) {
    return true;
  }
  return false;
}
