import { Permissions } from '@linen/types';

export default function createPermissions(
  options?: Partial<Permissions>
): Permissions {
  return {
    access: false,
    inbox: false,
    starred: false,
    chat: false,
    manage: false,
    channel_create: false,
    is_member: false,
    accountId: null,
    user: null,
    token: null,
    auth: null,
    ...options,
  };
}
