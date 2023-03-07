import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
  ThreadState,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';
import storage from '@linen/utilities/storage';
import * as api from 'utilities/requests';
import Content from './Content';
import { InboxConfig } from './types';
import { post } from 'utilities/http';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const fetchInbox = debounce(
  ({
    communityName,
    page,
    limit,
    configuration,
  }: {
    communityName: string;
    page: number;
    limit: number;
    configuration: InboxConfig;
  }) => {
    const channelIds = configuration.channels
      .filter((config) => config.subscribed)
      .map((config) => config.channelId);
    return post('/api/inbox', {
      communityName,
      page,
      limit,
      channelIds,
    }).catch(() => {
      throw new Error('Failed to fetch the inbox.');
    });
  }
);
const fetchThread = (accountId: string) => (threadId: string) =>
  api.getThread({ id: threadId, accountId });

const putThread =
  (accountId: string) =>
  (
    threadId: string,
    options: {
      state?: ThreadState | undefined;
      title?: string | undefined;
    }
  ) =>
    api.updateThread({
      accountId,
      id: threadId,
      ...options,
    });

export default function Inbox({
  channels,
  currentCommunity,
  communities,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  useEffect(() => {
    storage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'inbox',
    });
  }, [currentCommunity]);

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <Content
        fetchInbox={fetchInbox}
        fetchThread={fetchThread(settings.communityId)}
        putThread={putThread(settings.communityId)}
        channels={channels}
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
      />
    </PageLayout>
  );
}
