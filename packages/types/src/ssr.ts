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
