import PageLayout from '../../layout/PageLayout';
import { buildChannelSeo } from 'utilities/seo';
import { ChannelSerialized } from 'lib/channel';
import Content from 'components/Pages/Channel/Content/Content';
import ContentForBots from 'components/Pages/Channel/Content/ContentForBots';
import { SerializedAccount } from 'serializers/account';
import { Settings } from 'serializers/account/settings';
import { SerializedThread } from 'serializers/thread';
import { Permissions } from 'types/shared';

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

export default function Channel({
  threads,
  pinnedThreads,
  channels,
  currentChannel,
  currentCommunity,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
  permissions,
}: Props) {
  return (
    <PageLayout
      currentChannel={currentChannel}
      seo={{
        ...buildChannelSeo({
          settings,
          channelName,
          isSubDomainRouting,
          pathCursor,
          threads,
        }),
      }}
      channels={channels as ChannelSerialized[]}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
    >
      {isBot ? (
        <ContentForBots
          threads={threads}
          settings={settings}
          channelName={channelName}
          isSubDomainRouting={isSubDomainRouting}
          nextCursor={nextCursor}
          isBot={isBot}
          permissions={permissions}
        />
      ) : (
        <Content
          threads={threads}
          pinnedThreads={pinnedThreads}
          currentChannel={currentChannel}
          currentCommunity={currentCommunity}
          settings={settings}
          channelName={channelName}
          isSubDomainRouting={isSubDomainRouting}
          nextCursor={nextCursor}
          pathCursor={pathCursor}
          isBot={isBot}
          permissions={permissions}
          key={settings.communityName + channelName}
        />
      )}
    </PageLayout>
  );
}
