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

export interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  communities: SerializedAccount[];
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
}

export default function SettingsPage({
  channels,
  currentCommunity,
  communities,
  settings,
  permissions,
  isSubDomainRouting,
}: Props) {
  useEffect(() => {
    storage.set('pages.last', {
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
      className="w-full"
    >
      <Header />
      <Content currentCommunity={currentCommunity} />
    </PageLayout>
  );
}
