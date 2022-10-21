import { channels, users, ThreadState } from '@prisma/client';
import { Permissions } from 'types/shared';
import { SerializedUser } from 'serializers/user';
import { SerializedAccount } from 'serializers/account';
import { SerializedThread } from 'serializers/thread';

export type ThreadByIdResponse = ThreadById | { notFound: boolean };

export interface ThreadByIdProp extends ThreadById {
  isSubDomainRouting: boolean;
  permissions: Permissions;
}

export type ThreadById = {
  thread: SerializedThread;
  externalThreadId: string | null;
  channelId: string;
  currentChannel: ChannelSerialized;
  currentCommunity: SerializedAccount | null;
  channel: ChannelSerialized;
  authors: users[];
  channels: ChannelSerialized[];
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
