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
  channels: initialChannels,
  currentCommunity,
  communities,
  settings,
  permissions,
  isSubDomainRouting,
  dms,
}: Props) {
  const [channels, setChannels] =
    useState<SerializedChannel[]>(initialChannels);

  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'settings',
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
      className="w-full"
      dms={dms}
    >
      <ConfigurationsView
        currentCommunity={currentCommunity}
        channels={channels}
        setChannels={setChannels}
        api={api}
      />
    </PageLayout>
  );
}
