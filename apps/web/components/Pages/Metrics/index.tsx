import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';
import MetricsView from '@linen/ui/MetricsView';
import { api } from 'utilities/requests';

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  dms: SerializedChannel[];
  isSubDomainRouting: boolean;
}

export default function Metrics({
  channels,
  currentCommunity,
  communities,
  settings,
  permissions,
  dms,
  isSubDomainRouting,
}: Props) {
  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'metrics',
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
      <MetricsView currentCommunity={currentCommunity} api={api} />
    </PageLayout>
  );
}
