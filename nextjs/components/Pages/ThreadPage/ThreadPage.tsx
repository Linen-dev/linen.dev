import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useEffect, useState, useRef } from 'react';
import { Thread } from 'components/Thread';
import { buildThreadSeo } from 'utilities/seo';
import { ThreadState } from '@prisma/client';
import { scrollToBottom } from 'utilities/scroll';
import { isChatEnabled } from 'utilities/featureFlags';

export function ThreadPage({
  id,
  threadId,
  messages,
  channels,
  currentChannel,
  currentUser,
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
  const ref = useRef<HTMLDivElement>(null);
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
      innerRef={ref}
    >
      <div className="w-full">
        <Thread
          key={id}
          id={id}
          channelId={currentChannel.id}
          channelName={currentChannel.channelName}
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
          currentUser={currentUser}
          onThreadUpdate={(state: ThreadState) => setState(state)}
          onSend={() => {
            scrollToBottom(ref.current as HTMLElement);
          }}
          onMount={() => {
            isChatEnabled &&
              currentUser &&
              scrollToBottom(ref.current as HTMLElement);
          }}
        />
      </div>
    </PageLayout>
  );
}
