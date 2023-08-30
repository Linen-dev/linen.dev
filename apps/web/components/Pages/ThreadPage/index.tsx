import PageLayout from 'components/layout/PageLayout';
import { ThreadProps } from '@linen/types';
import { useRef } from 'react';
import { buildThreadSeo, buildStructureData } from 'utilities/seo';
import ThreadView from '@linen/ui/ThreadView';
import { useJoinContext } from 'contexts/Join';
import { api } from 'utilities/requests';
import { useUsersContext } from '@linen/contexts/Users';

export function ThreadPage({
  thread,
  channels,
  communities,
  currentChannel,
  currentCommunity,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  dms,
}: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);

  const seo = buildThreadSeo({
    isSubDomainRouting,
    channelName: currentChannel.channelName,
    settings,
    thread,
  });

  return (
    <PageLayout
      key={thread.id}
      seo={{
        description: seo.description,
        title: seo.title,
        url: seo.url,
        image: seo.image,
        robotsMetaTag: seo.robotsMetaTag,
      }}
      currentChannel={currentChannel}
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      innerRef={ref}
      dms={dms}
    >
      {buildStructureData({ thread, isSubDomainRouting, settings })}
      <ThreadView
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
        thread={thread}
        isBot={isBot}
        useJoinContext={useJoinContext}
        api={api}
        useUsersContext={useUsersContext}
      />
    </PageLayout>
  );
}
