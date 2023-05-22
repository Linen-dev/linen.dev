import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
  Settings,
} from '@linen/types';
import PlansView from '@linen/ui/PlansView';
import { api } from 'utilities/requests';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function PlansPage({
  channels,
  communities,
  permissions,
  settings,
  currentCommunity,
  isSubDomainRouting,
  dms,
}: Props) {
  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      dms={dms}
    >
      <PlansView currentCommunity={currentCommunity} api={api} />
    </PageLayout>
  );
}
