import { SerializedUser } from './users';
import { makeEnum } from './utils/makeEnum';

export const MessageFormat = makeEnum({
  DISCORD: 'DISCORD',
  SLACK: 'SLACK',
  LINEN: 'LINEN',
  MATRIX: 'MATRIX',
});

export type MessageFormat = typeof MessageFormat[keyof typeof MessageFormat];

export interface SerializedMessage {
  id: string;
  body: string;
  sentAt: string;
  usersId: string;
  mentions: SerializedUser[];
  attachments: SerializedAttachment[];
  reactions: SerializedReaction[];
  threadId: string;
  externalId: string | null;
  author: SerializedUser | null;
  messageFormat: MessageFormat;
}

export interface SerializedReaction {
  type: string;
  count: number;
  users: SerializedUser[];
}

export interface SerializedAttachment {
  url: string;
  name: string;
}

export type SerializedSearchMessage = SerializedMessage & {
  channelId: string;
  thread: {
    incrementId?: number;
    slug?: string | null;
  };
};

export type messages = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  body: string;
  sentAt: Date;
  channelId: string;
  externalMessageId: string | null;
  threadId: string | null;
  usersId?: string | null;
  messageFormat: MessageFormat | null;
};

export const MentionType = makeEnum({
  signal: 'signal',
  user: 'user',
});

export type MentionType = typeof MentionType[keyof typeof MentionType];

export interface MentionNode {
  type: MentionType;
  id: string;
  source: string;
}
