import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import Header from './Header';
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

export default function Metrics({ channels, settings, permissions }: Props) {
  return (
    <PageLayout
      channels={channels}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={false}
      token={null}
      className="w-full"
    >
      <Header />
    </PageLayout>
  );
}
