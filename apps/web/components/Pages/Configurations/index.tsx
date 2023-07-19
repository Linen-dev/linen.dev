import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  SerializedChannel,
  Settings,
  SerializedAccount,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import { api } from 'utilities/requests';
import ConfigurationsView from '@linen/ui/ConfigurationsView';

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function ConfigurationsPage({
  channels,
  currentCommunity,
  communities,
  settings,
  permissions,
  isSubDomainRouting,
  dms,
}: Props) {
  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'configurations',
    });
  }, [currentCommunity]);

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      dms={dms}
    >
      <ConfigurationsView currentCommunity={currentCommunity} api={api} />
    </PageLayout>
  );
}
