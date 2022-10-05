import PageLayout from 'components/layout/PageLayout';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import { useEffect, useState, useRef } from 'react';
import { buildThreadSeo } from 'utilities/seo';
import Content from './Content';

export function ThreadPage({
  id,
  threadId,
  channels,
  currentChannel,
  currentUser,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  slug,
  incrementId,
  messages,
  title,
  state,
  permissions,
  token,
}: ThreadByIdProp) {
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
      <Content
        id={id}
        threadId={threadId}
        currentChannel={currentChannel}
        currentUser={currentUser}
        threadUrl={threadUrl}
        viewCount={viewCount}
        isSubDomainRouting={isSubDomainRouting}
        settings={settings}
        slug={slug}
        incrementId={incrementId}
        messages={messages}
        title={title}
        state={state}
        permissions={permissions}
        token={token}
      />
    </PageLayout>
  );
}
