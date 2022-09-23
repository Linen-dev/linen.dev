import { channels, users, ThreadState } from '@prisma/client';
import { Permissions } from 'types/shared';
import { SerializedUser } from 'serializers/user';

export type ThreadByIdResponse = ThreadById | { notFound: boolean };

export interface ThreadByIdProp extends ThreadById {
  isSubDomainRouting: boolean;
  permissions: Permissions;
}

export interface MentionsWithUsers extends mentions {
  users: users;
}

export type ThreadById = {
  id: string;
  incrementId: number;
  externalThreadId: string | null;
  viewCount: number;
  slug: string;
  messageCount: number;
  channelId: string;
  currentChannel: ChannelSerialized;
  currentUser?: SerializerUser;
  messages: SerializedMessage[];
  channel: ChannelSerialized;
  threadId: string;
  authors: users[];
  channels: ChannelSerialized[];
  threadUrl: string | null;
  settings: Settings;
  pathCursor: string;
  title: string | null;
  state: ThreadState;
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
