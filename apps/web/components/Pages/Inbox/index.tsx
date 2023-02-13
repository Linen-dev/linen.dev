import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  Scope,
  SerializedAccount,
  SerializedChannel,
  Settings,
  ThreadState,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';
import storage from '@linen/utilities/storage';
import * as api from 'utilities/requests';
import Content from './Content';

interface Props {
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
    state,
    scope,
    page,
  }: {
    communityName: string;
    state: ThreadState;
    scope: Scope;
    page: number;
  }) => {
    return fetch(
      `/api/inbox?communityName=${communityName}&state=${state}&scope=${scope}&page=${page}`,
      {
        method: 'GET',
      }
    ).then((response) => {
      if (response.ok) {
        return response.json();
      }
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

const fetchTotal = ({
  communityName,
  state,
  scope,
}: {
  communityName: string;
  state: ThreadState;
  scope: Scope;
}) => {
  return fetch(
    `/api/inbox?communityName=${communityName}&state=${state}&scope=${scope}&total=true`,
    {
      method: 'GET',
    }
  ).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch the inbox.');
  });
};

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
        fetchTotal={fetchTotal}
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
      />
    </PageLayout>
  );
}
