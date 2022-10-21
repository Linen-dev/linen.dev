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
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
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
      channels={channels}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      innerRef={ref}
    >
      <Content
        thread={thread}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        threadUrl={threadUrl}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        permissions={permissions}
      />
    </PageLayout>
  );
}
