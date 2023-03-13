import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedThread,
  Settings,
} from '@linen/types';
import { useRef } from 'react';
import { buildThreadSeo, buildStructureData } from 'utilities/seo';
import Content from './Content';

export interface Props {
  isBot?: boolean;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  communities: SerializedAccount[];
  thread: SerializedThread;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  channels: SerializedChannel[];
  threadUrl: string | null;
  settings: Settings;
  dms: SerializedChannel[];
}

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
}: Props) {
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
      <div className="flex flex-col w-full">
        <Content
          thread={thread}
          currentChannel={currentChannel}
          currentCommunity={currentCommunity}
          threadUrl={threadUrl}
          isBot={isBot}
          isSubDomainRouting={isSubDomainRouting}
          settings={settings}
          permissions={permissions}
        />
      </div>
    </PageLayout>
  );
}
