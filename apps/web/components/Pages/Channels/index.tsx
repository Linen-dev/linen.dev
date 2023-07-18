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
import ChannelsView from '@linen/ui/ChannelsView';

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function ChannelsPage({
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
      page: 'channels',
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
      <ChannelsView
        currentCommunity={currentCommunity}
        channels={channels}
        setChannels={setChannels}
        api={api}
      />
    </PageLayout>
  );
}
