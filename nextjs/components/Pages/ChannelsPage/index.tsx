import type { Settings } from 'serializers/account/settings';
import ChannelPage from './ChannelPage';
import type { Permissions } from 'types/shared';
import type { SerializedThread } from 'serializers/thread';
import type { ChannelSerialized } from 'lib/channel';
import { SerializedAccount } from 'serializers/account';

interface Props {
  settings: Settings;
  channelName: string;
  channels?: ChannelSerialized[];
  currentChannel: ChannelSerialized;
  currentCommunity: SerializedAccount | null;
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

export default function ChannelView(props: Props) {
  return <ChannelPage {...props} />;
}
