import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import Content from './Content';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  Settings,
} from '@linen/types';

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
