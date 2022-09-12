import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useEffect } from 'react';
import { Thread } from 'components/Thread';
import { buildThreadSeo } from 'utilities/seo';

export function ThreadPage({
  id,
  threadId,
  messages,
  channels,
  currentChannel,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  slug,
  incrementId,
  title,
  permissions,
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
      channels={channels}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
    >
      <div className="max-w-[700px]">
        <Thread
          id={id}
          channelId={currentChannel.id}
          title={title}
          messages={messages}
          threadUrl={threadUrl}
          viewCount={viewCount}
          settings={settings}
          incrementId={incrementId}
          isSubDomainRouting={isSubDomainRouting}
          slug={slug}
          permissions={permissions}
        />
      </div>
    </PageLayout>
  );
}
