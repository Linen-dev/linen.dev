import { makeEnum } from './utils/makeEnum';

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
export * from './roles';
export * from './api';

export * from './patterns';
export * from './notification';
export * from './sync';
export * from './slack';
export * from './cursor';
export * from './discord';
export * from './partialTypes';
export * from './server';
export * from './vercel';
export * from './logger';
export * from './Permissions';
export * from './SerializedSearchSettings';
export * from './mentions';
export * from './messageAttachments';
export * from './messageReactions';
export * from './slackAuthorizations';
export * from './userThreadStatus';

/*
  This package redefines enums from `schema.prisma`.
  Ideally this package should be considered as a source of truth
  and not have on other dependencies.
*/

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

export const UploadEnum = makeEnum({
  logos: 'logos',
  attachments: 'attachments',
  'slack-import': 'slack-import',
});
export type UploadEnum = typeof UploadEnum[keyof typeof UploadEnum];

export enum Period {
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export type StartSignUpProps = {
  flow?: AuthFlow;
  communityId: string;
  redirectUrl?: string;
};

export type AuthFlow = 'signup' | 'signin';

export type StartSignUpFn = (props: StartSignUpProps) => any;

export type SignInMode = 'creds' | 'magic';
