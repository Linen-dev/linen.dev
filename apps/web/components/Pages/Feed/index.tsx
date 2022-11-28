import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  Scope,
  SerializedChannel,
  Settings,
  ThreadState,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';

import Content from './Content';

interface Props {
  channels: SerializedChannel[];
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

export default function Feed({
  channels,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  return (
    <PageLayout
      channels={channels}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <Content
        fetchFeed={fetchFeed}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
      />
    </PageLayout>
  );
}
