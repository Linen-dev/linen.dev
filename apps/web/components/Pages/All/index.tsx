import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import { api } from 'utilities/requests';
import AllView from '@linen/ui/AllView';
import { useUsersContext } from '@linen/contexts/Users';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  dms: SerializedChannel[];
}

export default function All({
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
      page: 'all',
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
      <AllView
        currentCommunity={currentCommunity}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
        api={api}
        useUsersContext={useUsersContext}
      />
    </PageLayout>
  );
}
