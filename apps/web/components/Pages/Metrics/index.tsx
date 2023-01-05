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
import storage from '@linen/utilities/storage';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
}

export default function Metrics({
  channels,
  currentCommunity,
  settings,
  permissions,
}: Props) {
  useEffect(() => {
    storage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'metrics',
    });
  }, [currentCommunity]);

  return (
    <PageLayout
      channels={channels}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={false}
      className="w-full"
    >
      <Header />
      <Content communityId={currentCommunity.id} />
    </PageLayout>
  );
}
