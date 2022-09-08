import PageLayout from 'components/layout/PageLayout';
import { channels } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';

interface Props {
  channels: channels[];
  communityName: string;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

export default function Inbox({
  channels,
  communityName,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      Inbox
    </PageLayout>
  );
}
