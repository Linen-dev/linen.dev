import { SerializedUser } from './users';

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

export enum MessageFormat {
  DISCORD = 'DISCORD',
  SLACK = 'SLACK',
  LINEN = 'LINEN',
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
