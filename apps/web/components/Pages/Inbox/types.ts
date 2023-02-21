import { SerializedChannel, SerializedThread } from '@linen/types';

export interface InboxResponse {
  threads: SerializedThread[];
  total: number;
}

export interface InboxConfig {
  channels: InboxChannelConfig[];
}

export interface InboxChannelConfig {
  channel: SerializedChannel;
  subscribed: boolean;
}

export interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}
