import { channels, users } from '@prisma/client';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedThread,
  SerializedUser,
  ThreadState,
} from '@linen/types';

export type ThreadByIdResponse = ThreadById | { notFound: boolean };

export interface ThreadByIdProp extends ThreadById {
  isSubDomainRouting: boolean;
  permissions: Permissions;
  pagination: {
    next: any;
    prev: any;
  } | null;
}

export type ThreadById = {
  thread: SerializedThread;
  externalThreadId: string | null;
  channelId: string;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount | null;
  communities: SerializedAccount[];
  channel: SerializedChannel;
  authors: users[];
  channels: SerializedChannel[];
  threadUrl: string | null;
  settings: Settings;
  pathCursor: string;
};

export interface Author {
  id: string;
  externalUserId: string;
  displayName: string;
  profileImageUrl: any;
  isBot: boolean;
  isAdmin: boolean;
  accountsId: string;
}
