import { SerializedThread } from '@linen/types';

export interface InboxResponse {
  threads: SerializedThread[];
  total: number;
}

export interface InboxConfig {
  channels: InboxChannelConfig[];
}

export interface InboxChannelConfig {
  channelId: string;
  subscribed: boolean;
}

export interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}
