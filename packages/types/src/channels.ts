import { SerializedThread } from './threads';

export type SerializedChannel = {
  id: string;
  channelName: string;
  default: boolean;
  landing: boolean;
  hidden: boolean;
  accountId: string | null;
  pages: number | null;
  stats?: string;
  displayOrder: number;
  viewType: 'CHAT' | 'FORUM';
  type?: 'DM' | 'PUBLIC' | 'PRIVATE' | null;
};

export type ChannelViewType = 'CHAT' | 'FORUM';

export enum channelsIntegrationType {
  'GITHUB' = 'GITHUB',
  'EMAIL' = 'EMAIL',
  'LINEAR' = 'LINEAR',
}

export type channelNextPageType = {
  threads: SerializedThread[];
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
};
