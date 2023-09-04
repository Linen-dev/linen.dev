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
