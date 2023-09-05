import { makeEnum } from './utils/makeEnum';
import { SerializedThread } from './threads';

export const ChannelType = makeEnum({
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
  DM: 'DM',
});

export type ChannelType = typeof ChannelType[keyof typeof ChannelType];

export const ChannelViewType = makeEnum({
  CHAT: 'CHAT',
  FORUM: 'FORUM',
  TOPIC: 'TOPIC',
});

export type ChannelViewType =
  typeof ChannelViewType[keyof typeof ChannelViewType];

export type SerializedChannel = {
  id: string;
  channelName: string;
  default: boolean;
  landing: boolean;
  readonly: boolean;
  hidden: boolean;
  accountId: string | null;
  pages: number | null;
  stats?: string;
  displayOrder: number;
  viewType: ChannelViewType;
  type?: ChannelType | null;
};

export const channelsIntegrationType = makeEnum({
  GITHUB: 'GITHUB',
  EMAIL: 'EMAIL',
  LINEAR: 'LINEAR',
});

export type channelsIntegrationType =
  typeof channelsIntegrationType[keyof typeof channelsIntegrationType];

export type channelNextPageType = {
  threads: SerializedThread[];
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
};

export const NewChannelsConfig = makeEnum({
  HIDDEN: 'HIDDEN',
  NOT_HIDDEN: 'NOT_HIDDEN',
});

export type NewChannelsConfig =
  typeof NewChannelsConfig[keyof typeof NewChannelsConfig];

export const ChannelOrderBy = makeEnum({
  THREAD_SENT_AT: 'THREAD_SENT_AT',
  THREAD_LAST_REPLY_AT: 'THREAD_LAST_REPLY_AT',
});
export type ChannelOrderBy = typeof ChannelOrderBy[keyof typeof ChannelOrderBy];

export type channels = {
  id: string;
  channelName: string;
  externalChannelId: string | null;
  accountId: string | null;
  hidden: boolean;
  default: boolean;
  landing: boolean;
  readonly: boolean;
  externalPageCursor: string | null;
  pages: number | null;
  lastPageBuildAt: bigint | null;
  createdByUserId: string | null;
  type: ChannelType | null;
  createdAt: Date;
  updatedAt: Date | null;
  archived: boolean;
  displayOrder: number | null;
  viewType: ChannelViewType;
  orderBy: ChannelOrderBy;
};
