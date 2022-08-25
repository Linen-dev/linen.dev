import PageLayout from '../../layout/PageLayout';
import { ChannelViewProps } from '.';
import { Channel } from 'components/Channel';
import { buildChannelSeo } from 'utilities/seo';

export default function ChannelPage({
  threads,
  channels,
  currentChannel,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
}: ChannelViewProps) {
  if (!threads) {
    return <div />;
  }

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
      navItems={{ channels }}
      settings={settings}
      communityName={settings.communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <Channel
        threads={threads}
        currentChannel={currentChannel}
        settings={settings}
        channelName={channelName}
        isSubDomainRouting={isSubDomainRouting}
        nextCursor={nextCursor}
        pathCursor={pathCursor}
        isBot={isBot}
      />
    </PageLayout>
  );
}

function hasPathCursor(pathCursor?: string | null) {
  return !!pathCursor;
}

// Scenarios
// When it is mobile screen and no thread we show the main messages
// When it is mobile screen and there is thread we show the thread
// When it is mobile screen and there is a thread showing if we click on the back button it goes back to the main thread
