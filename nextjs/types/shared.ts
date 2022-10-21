import type { SerializedUser } from 'serializers/user';

export interface SerializedAttachment {
  url: string;
  name: string;
}

export interface Permissions {
  access: boolean;
  feed: boolean;
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

export enum Scope {
  All = 'all',
  Participant = 'participant',
}
