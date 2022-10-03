import PageLayout from '../../layout/PageLayout';
import { ChannelViewProps } from '.';
import { Channel, ChannelForBots } from 'components/Channel';
import { buildChannelSeo } from 'utilities/seo';

export default function ChannelPage({
  threads,
  channels,
  currentChannel,
  currentUser,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
  permissions,
  token,
}: ChannelViewProps) {
  if (!threads) {
    return <div />;
  }

  const ComponentToRender = isBot ? ChannelForBots : Channel;

  return (
    <PageLayout
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
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
      channels={channels}
      settings={settings}
      communityName={settings.communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
    >
      <ComponentToRender
        threads={threads}
        currentChannel={currentChannel}
        currentUser={currentUser}
        settings={settings}
        channelName={channelName}
        isSubDomainRouting={isSubDomainRouting}
        nextCursor={nextCursor}
        pathCursor={pathCursor}
        isBot={isBot}
        permissions={permissions}
        token={token}
      />
    </PageLayout>
  );
}

// Scenarios
// When it is mobile screen and no thread we show the main messages
// When it is mobile screen and there is thread we show the thread
// When it is mobile screen and there is a thread showing if we click on the back button it goes back to the main thread
