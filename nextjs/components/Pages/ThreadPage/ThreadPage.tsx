import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { SerializedMessage } from 'serializers/thread';
import { useEffect } from 'react';
import { Thread } from 'components/Thread';

export function ThreadPage({
  threadId,
  messages,
  channels,
  currentChannel,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
}: ThreadByIdProp) {

  useEffect(() => {
    threadId &&
      fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  if (!threadId) {
    return <div></div>;
  }

  function buildTitle(
    channelName: string | undefined,
    message?: SerializedMessage
  ) {
    const channel = !!channelName ? `#${channelName}` : '';
    return `${channel} - ${message?.body.slice(0, 30)}`;
  }

  return (
    <PageLayout
      seo={{
        title: buildTitle(currentChannel?.channelName, messages[0]),
      }}
      communityName={settings.communityName}
      currentChannel={currentChannel}
      navItems={{ channels: channels }}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <Thread
        messages={messages}
        threadUrl={threadUrl}
        settings={settings}
        viewCount={viewCount}
      />
    </PageLayout>
  );
}
