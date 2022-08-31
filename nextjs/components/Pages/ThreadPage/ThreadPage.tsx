import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useEffect } from 'react';
import { Thread } from 'components/Thread';
import { buildThreadSeo } from 'utilities/seo';

export function ThreadPage({
  threadId,
  messages,
  channels,
  currentChannel,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  slug,
}: ThreadByIdProp) {
  useEffect(() => {
    threadId &&
      fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  if (!threadId) {
    return <div></div>;
  }

  return (
    <PageLayout
      seo={{
        ...buildThreadSeo({
          isSubDomainRouting,
          channelName: currentChannel.channelName,
          messages,
          settings,
          threadId,
          slug,
        }),
      }}
      communityName={settings.communityName}
      currentChannel={currentChannel}
      navItems={{ channels: channels }}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="max-w-[700px]">
        <Thread
          messages={messages}
          threadUrl={threadUrl}
          communityType={settings.communityType}
          viewCount={viewCount}
        />
      </div>
    </PageLayout>
  );
}
