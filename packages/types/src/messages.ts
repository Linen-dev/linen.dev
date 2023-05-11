import { SerializedUser } from './users';

export type MessageFormat = 'DISCORD' | 'SLACK' | 'LINEN';
export const MessageFormat = {
  DISCORD: 'DISCORD' as MessageFormat,
  SLACK: 'SLACK' as MessageFormat,
  LINEN: 'LINEN' as MessageFormat,
};

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
