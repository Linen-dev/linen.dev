import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import { Permissions, SerializedChannel, Settings } from '@linen/types';

import Content from './Content';

interface Props {
  channels: SerializedChannel[];
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

export default function Feed({
  channels,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  return (
    <PageLayout
      channels={channels}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <Content
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
      />
    </PageLayout>
  );
}
