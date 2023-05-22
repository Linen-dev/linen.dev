import PageLayout from 'components/layout/PageLayout';
import {
  SerializedAccount,
  SerializedChannel,
  Settings,
  Permissions,
} from '@linen/types';
import MembersView from '@linen/ui/MembersView';
import { useRouter } from 'next/router';
import { api } from 'utilities/requests';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  settings: Settings;
  permissions: Permissions;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function Members({
  channels,
  communities,
  settings,
  permissions,
  currentCommunity,
  isSubDomainRouting,
  dms,
}: Props) {
  const router = useRouter();

  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      permissions={permissions}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
      dms={dms}
    >
      <MembersView
        currentCommunity={currentCommunity}
        routerReload={router.reload}
        api={api}
      />
    </PageLayout>
  );
}
