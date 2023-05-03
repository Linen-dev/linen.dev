import PageLayout from 'components/layout/PageLayout';
import { ThreadProps } from '@linen/types';
import { useRef } from 'react';
import { buildThreadSeo, buildStructureData } from 'utilities/seo';
import ThreadView from '@linen/ui/ThreadView';
import { useJoinContext } from 'contexts/Join';
import * as api from 'utilities/requests';
import Actions from 'components/Actions';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import { useUsersContext } from '@linen/contexts/Users';

export function ThreadPage({
  thread,
  channels,
  communities,
  currentChannel,
  currentCommunity,
  threadUrl,
  isBot,
  isSubDomainRouting,
  settings,
  permissions,
  dms,
}: ThreadProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <PageLayout
      key={thread.id}
      seo={{
        ...buildThreadSeo({
          isSubDomainRouting,
          channelName: currentChannel.channelName,
          settings,
          thread,
        }),
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
        {...{
          currentChannel,
          currentCommunity,
          isSubDomainRouting,
          permissions,
          settings,
          thread,
          threadUrl,
          isBot,
          Actions,
          JoinChannelLink,
          useJoinContext,
          apiFetchMentions: api.fetchMentions,
          apiPut: api.put,
          apiUpdateThread: api.updateThread,
          apiUpdateMessage: api.updateMessage,
          apiUpload: api.upload,
          apiCreateMessage: api.createMessage,
          useUsersContext,
        }}
      />
    </PageLayout>
  );
}
