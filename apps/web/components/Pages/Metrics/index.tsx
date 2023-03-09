import { useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import Content from './Content';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';
import { localStorage } from '@linen/utilities/storage';

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
      <Header />
      <Content communityId={currentCommunity.id} />
    </PageLayout>
  );
}
