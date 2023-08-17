import { SerializedUser } from './users';

export interface Permissions {
  access: boolean;
  inbox: boolean;
  starred: boolean;
  chat: boolean;
  manage: boolean;
  channel_create: boolean;
  is_member: boolean;
  accountId: string | null;
  token: string | null;
  user: SerializedUser | null;
  auth: {
    id: string;
    email: string;
  } | null;
}
