export interface SerializedReaction {
  type: string;
  count: number;
}

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
  user: {
    id: string | null;
    accountId: string | null;
    authId: string | null;
  } | null;
}

export enum Scope {
  All = 'all',
  Participant = 'participant',
}
