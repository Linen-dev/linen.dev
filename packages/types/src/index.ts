export * from './channels';
export * from './threads';
export * from './messages';
export * from './users';

export * from './integrations/threads';
export * from './integrations/channels';
export * from './integrations/messages';
export * from './integrations/users';

export * from './api/channels';
export * from './api/users';

export * from './patterns';
export * from './notification';
export * from './sync';
export * from './slack';
export * from './cursor';
export * from './discord';
export * from './partialTypes';
export * from './server';

/*
  This package redefines enums from `schema.prisma`.
  Ideally this package should be considered as a source of truth
  and not have on other dependencies.
*/

export enum AccountType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum AccountIntegration {
  NONE = 'NONE',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
}

export enum ChatType {
  NONE = 'NONE',
  MANAGERS = 'MANAGERS',
  MEMBERS = 'MEMBERS',
}

export enum CommunityType {
  'discord' = 'discord',
  'slack' = 'slack',
  'linen' = 'linen',
}

export enum Roles {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ThreadStatus {
  UNREAD = 'unread',
  READ = 'read',
  MUTED = 'muted',
  REMINDER = 'reminder',
}

export enum ReminderTypes {
  SOON = 'soon',
  TOMORROW = 'tomorrow',
  NEXT_WEEK = 'next-week',
}

export enum Priority {
  MOUSE,
  KEYBOARD,
}

export interface SerializedUserThreadStatus {
  threadId: string;
  userId: string;
  muted: boolean;
  read: boolean;
}

export interface SerializedAccount {
  id: string;
  type: AccountType;
  name?: string;
  description?: string;
  homeUrl?: string;
  docsUrl?: string;
  logoUrl?: string;
  logoSquareUrl?: string;
  faviconUrl?: string;
  redirectDomain?: string;
  brandColor?: string;
  premium: boolean;
  googleAnalyticsId?: string;
  syncStatus: string;
  communityType: CommunityType | null;
  anonymizeUsers?: boolean;
  hasAuth?: boolean;
  slackDomain?: string;
  discordDomain?: string;
  discordServerId?: string;
  communityInviteUrl?: string;
  chat: ChatType | null;
  communityUrl?: string;
  newChannelsConfig: string;
}

export interface SerializedReadStatus {
  channelId: string;
  lastReadAt: string;
  lastReplyAt?: string;
  read: boolean;
}

export type Settings = {
  communityId: string;
  communityType: CommunityType;
  googleAnalyticsId?: string | undefined;
  googleSiteVerification?: string | undefined;
  name: string | null;
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  communityUrl: string;
  communityInviteUrl: string;
  communityName: string;
  redirectDomain?: string;
  prefix?: 'd' | 's';
  chat: ChatType | null;
};

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
  user: any | null;
  auth: {
    id: string;
    email: string;
  } | null;
}

export enum Scope {
  All = 'all',
  Participant = 'participant',
}

export interface UploadedFile {
  id: string;
  url: string;
}

export type ChannelsIntegration = {
  externalId: string;
  data: any;
};

export type onResolve = (threadId: string, messageId?: string) => void;
