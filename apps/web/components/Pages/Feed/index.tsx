import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';

import Content from './Content';

interface Props {
  channels: channels[];
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
