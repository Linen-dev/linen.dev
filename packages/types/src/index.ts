export * from './channels';
export * from './threads';
export * from './messages';
export * from './users';
export * from './accounts';
export * from './ssr';

export * from './integrations/threads';
export * from './integrations/channels';
export * from './integrations/messages';
export * from './integrations/users';

export * from './api';

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

export enum AccountIntegration {
  NONE = 'NONE',
  SLACK = 'SLACK',
  DISCORD = 'DISCORD',
}

export enum Roles {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
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

export interface SerializedReadStatus {
  channelId: string;
  lastReadAt: string;
  lastReplyAt?: string;
  read: boolean;
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
