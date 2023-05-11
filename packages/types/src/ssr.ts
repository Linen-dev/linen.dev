import { SerializedAccount, Settings, Permissions } from './accounts';
import { SerializedChannel } from './channels';
import { SerializedThread } from './threads';

export interface ChannelProps {
  settings: Settings;
  channelName: string;
  channels: SerializedChannel[];
  dms: SerializedChannel[];
  communities: SerializedAccount[];
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  pinnedThreads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
}

export interface ThreadProps {
  isBot?: boolean;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  communities: SerializedAccount[];
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  threadUrl: string | null;
  settings: Settings;
  dms: SerializedChannel[];
}

export interface InboxProps {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  dms: SerializedChannel[];
}

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

export type validatePermissionsResponse = {
  redirect: Boolean;
  error: 'private' | 'forbidden';
};

export interface StarredResponse {
  threads: SerializedThread[];
  total: number;
}
