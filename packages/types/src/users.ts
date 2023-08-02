import { Roles } from './roles';

export interface SerializedUser {
  id: string;
  authsId: string | null;
  username: string | null;
  displayName: string | null;
  externalUserId: string | null;
  profileImageUrl: string | null;
  anonymousAlias?: string | null;
  role?: Roles;
}
