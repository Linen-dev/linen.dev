import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useEffect, useState } from 'react';
import { Thread } from 'components/Thread';
import { buildThreadSeo } from 'utilities/seo';
import { ThreadState } from '@prisma/client';

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
  state: initialState,
  permissions,
}: ThreadByIdProp) {
  const [state, setState] = useState(initialState);
  useEffect(() => {
    threadId && fetch(`/api/count?incrementId=${threadId}`, { method: 'PUT' });
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
          key={id}
          id={id}
          channelId={currentChannel.id}
          title={title}
          state={state}
          messages={messages}
          threadUrl={threadUrl}
          viewCount={viewCount}
          settings={settings}
          incrementId={incrementId}
          isSubDomainRouting={isSubDomainRouting}
          slug={slug}
          permissions={permissions}
          onThreadUpdate={(state: ThreadState) => setState(state)}
        />
      </div>
    </PageLayout>
  );
}
