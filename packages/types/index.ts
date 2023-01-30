import { z } from 'zod';

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

export enum MessageFormat {
  DISCORD = 'DISCORD',
  SLACK = 'SLACK',
  LINEN = 'LINEN',
}

export enum Roles {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ThreadState {
  CLOSE = 'CLOSE',
  OPEN = 'OPEN',
}

export enum ThreadStatus {
  UNREAD = 'unread',
  READ = 'read',
  MUTED = 'muted',
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
}

export interface SerializedAttachment {
  url: string;
  name: string;
}

export type SerializedChannel = {
  id: string;
  channelName: string;
  default: boolean;
  hidden: boolean;
  accountId: string | null;
  pages: number | null;
};

export interface SerializedUser {
  id: string;
  authsId: string | null;
  username: string | null;
  displayName: string | null;
  externalUserId: string | null;
  profileImageUrl: string | null;
}

export interface SerializedMessage {
  id: string;
  body: string;
  sentAt: string;
  usersId: string;
  mentions: SerializedUser[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
  threadId: string;
  externalId?: string;
  author?: SerializedUser | null;
  messageFormat: MessageFormat;
}

export interface SerializedReaction {
  type: string;
  count: number;
  users: SerializedUser[];
}

export interface SerializedThread {
  id: string;
  incrementId: number;
  externalThreadId?: string | null;
  viewCount: number;
  slug: string | null;
  messageCount: number;
  hidden: boolean;
  title?: string | null;
  state: ThreadState;
  pinned: boolean;
  channelId: string;
  closeAt?: string;
  firstUserReplyAt?: string | null;
  firstManagerReplyAt?: string | null;
  sentAt: string;
  lastReplyAt: string;
  messages: SerializedMessage[];
  channel: SerializedChannel | null;
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
  feed: boolean;
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

/**
 * integrations
 */

export const threadPostSchema = z.object({
  channelId: z.string().uuid(),
  body: z.string().min(1),
  title: z.string().optional(),
  externalThreadId: z.string().min(1),
  authorId: z.string().uuid(),
  accountId: z.string().uuid(),
});
export type threadPostType = z.infer<typeof threadPostSchema>;

export const threadPutSchema = z.object({
  title: z.string().optional(),
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  externalThreadId: z.string().min(1),
  status: z.enum(['OPEN', 'CLOSE']),
});
export type threadPutType = z.infer<typeof threadPutSchema>;

export const threadFindSchema = z.object({
  channelId: z.string().uuid(),
  externalThreadId: z.string().min(1),
});
export type threadFindType = z.infer<typeof threadFindSchema>;

export const channelGetSchema = z.object({
  channelId: z.string().uuid().optional(),
  installationId: z.string().min(1).optional(),
});
export type channelGetType = z.infer<typeof channelGetSchema>;

export const messagePostSchema = z.object({
  accountId: z.string().uuid(),
  channelId: z.string().uuid(),
  threadId: z.string().uuid(),
  authorId: z.string().uuid(),
  externalMessageId: z.string().min(1),
  body: z.string().min(1),
});
export type messagePostType = z.infer<typeof messagePostSchema>;

export const userPostSchema = z.object({
  externalUserId: z.string().min(1),
  accountsId: z.string().uuid(),
  displayName: z.string().min(1),
  profileImageUrl: z.string().min(1).optional(),
});
export type userPostType = z.infer<typeof userPostSchema>;
