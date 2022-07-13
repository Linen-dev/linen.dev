import { channels, slackThreads, users } from '@prisma/client';

export type ThreadByIdResponse = ThreadById | { notFound: boolean };

export interface ThreadByIdProp extends ThreadById {
  isSubDomainRouting: boolean;
}

export interface MentionsWithUsers extends mentions {
  users: users;
}

export type ThreadById = {
  id: string;
  incrementId: number;
  slackThreadTs: string;
  viewCount: number;
  slug: string;
  messageCount: number;
  channelId: string;
  currentChannel: channels;
  messages: SerializedMessage[];
  channel: channelsl;
  threadId: string;
  authors: users[];
  channels: channels[];
  slackUrl?: string;
  communityInviteUrl?: string;
  threadUrl: string;
  threadCommunityInviteUrl?: string | null;
  settings: Settings;
  communityName: string;
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

export interface Settings {
  brandColor: string;
  homeUrl: string;
  docsUrl: string;
  logoUrl: string;
  googleAnalyticsId?: string;
  communityType: string;
}
