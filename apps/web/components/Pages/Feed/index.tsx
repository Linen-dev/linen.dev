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

import Content from './Content';

interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const fetchFeed = debounce(
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
      `/api/feed?communityName=${communityName}&state=${state}&scope=${scope}&page=${page}`,
      {
        method: 'GET',
      }
    ).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the feed.');
    });
  }
);

const fetchThread = (threadId: string) => {
  return fetch('/api/threads/' + threadId).then((response) => response.json());
};

const putThread = (threadId: string, options: object) => {
  return fetch(`/api/threads/${threadId}`, {
    method: 'PUT',
    body: JSON.stringify(options),
  });
};

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
    `/api/feed?communityName=${communityName}&state=${state}&scope=${scope}&total=true`,
    {
      method: 'GET',
    }
  ).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to fetch the feed.');
  });
};

export default function Feed({
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
      page: 'feed',
    });
  }, [currentCommunity]);

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <Content
        fetchFeed={fetchFeed}
        fetchThread={fetchThread}
        putThread={putThread}
        fetchTotal={fetchTotal}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
      />
    </PageLayout>
  );
}
