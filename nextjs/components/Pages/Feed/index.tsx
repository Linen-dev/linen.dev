import React from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels } from '@prisma/client';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';

import Content from './Content';

interface Props {
  channels: channels[];
  communityName: string;
  currentUser: SerializedUser;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  token: string | null;
}

export default function Feed({
  channels,
  communityName,
  currentUser,
  isSubDomainRouting,
  permissions,
  settings,
  token,
}: Props) {
  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <Content
        communityName={communityName}
        isSubDomainRouting={isSubDomainRouting}
        permissions={permissions}
        settings={settings}
        currentUser={currentUser}
        token={token}
      />
    </PageLayout>
  );
}
