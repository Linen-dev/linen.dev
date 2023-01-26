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
  isBot?: boolean;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  communities: SerializedAccount[];
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
  currentCommunity: SerializedAccount;
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
