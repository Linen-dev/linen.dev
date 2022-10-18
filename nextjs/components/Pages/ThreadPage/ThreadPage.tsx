import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useRef } from 'react';
import { buildThreadSeo } from 'utilities/seo';
import Content from './Content';

export function ThreadPage({
  thread,
  channels,
  currentChannel,
  currentCommunity,
  currentUser,
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
  token,
}: ThreadByIdProp) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <PageLayout
      seo={{
        ...buildThreadSeo({
          isSubDomainRouting,
          channelName: currentChannel.channelName,
          messages: thread.messages,
          settings,
          threadId: thread.id,
          slug: thread.slug || '',
        }),
      }}
      currentChannel={currentChannel}
      currentUser={currentUser}
      channels={channels}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      innerRef={ref}
      token={token}
    >
      <Content
        thread={thread}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        currentUser={currentUser}
        threadUrl={threadUrl}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
        token={token}
      />
    </PageLayout>
  );
}
