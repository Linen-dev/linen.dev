import PageLayout from '../../layout/PageLayout';
import { ChannelViewProps } from '.';
import { buildChannelSeo } from 'utilities/seo';
import { ChannelSerialized } from 'lib/channel';
import Channel from 'components/Channel/Channel';
import ChannelForBots from 'components/Channel/ChannelForBots';

export default function ChannelPage({
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
}: ChannelViewProps) {
  // reusing the type between few layers causes problems
  // we should explicitly define the type per component
  if (!threads) {
    return <div />;
  }

  const ComponentToRender = isBot ? ChannelForBots : Channel;

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
      <ComponentToRender
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
    </PageLayout>
  );
}
