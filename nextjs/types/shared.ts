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
  user: {
    id: string | null;
    accountId: string | null;
    authId: string | null;
    email: string | null;
  } | null;
}

export enum Scope {
  All = 'all',
  Participant = 'participant',
}
