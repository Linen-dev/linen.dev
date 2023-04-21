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
import { localStorage } from '@linen/utilities/storage';
import * as api from 'utilities/requests';
import Content from './Content';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  dms: SerializedChannel[];
}

const fetchData = debounce(
  ({
    communityName,
    page,
    limit,
  }: {
    communityName: string;
    page: number;
    limit: number;
  }) => {
    return fetch(
      `/api/starred?communityName=${communityName}&page=${page}&limit=${limit}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
      .then((response) => response.json())
      .catch(() => {
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

export default function Starred({
  channels,
  currentCommunity,
  communities,
  isSubDomainRouting,
  permissions,
  settings,
  dms,
}: Props) {
  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'starred',
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
      dms={dms}
    >
      <Content
        fetchData={fetchData}
        fetchThread={fetchThread(settings.communityId)}
        putThread={putThread(settings.communityId)}
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
        dms={dms}
      />
    </PageLayout>
  );
}
