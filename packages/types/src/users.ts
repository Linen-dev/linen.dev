import { SerializedSearchSettings } from './SerializedSearchSettings';
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
  search?: SerializedSearchSettings;
}

export type users = {
  id: string;
  externalUserId: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  isBot: boolean;
  isAdmin: boolean;
  anonymousAlias: string | null;
  searchSettings: string | null;
  accountsId: string;
  authsId: string | null;
  role: Roles;
  createdAt: Date;
  updatedAt: Date | null;
};
