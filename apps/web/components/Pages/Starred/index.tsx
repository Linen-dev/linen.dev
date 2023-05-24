import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import type {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import { api } from 'utilities/requests';
import StarredView from '@linen/ui/StarredView';
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
      <StarredView
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
