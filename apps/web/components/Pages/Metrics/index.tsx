import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
import Content from './Content';
import { SerializedAccount } from 'serializers/account';
import { SerializedChannel } from 'serializers/channel';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
}

const stats = [
  { name: 'Total Subscribers', stat: '71,897' },
  { name: 'Avg. Open Rate', stat: '58.16%' },
  { name: 'Avg. Click Rate', stat: '24.57%' },
];

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
