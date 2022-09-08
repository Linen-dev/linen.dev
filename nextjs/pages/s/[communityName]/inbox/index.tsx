import PageLayout from 'components/layout/PageLayout';
import { GetServerSidePropsContext } from 'next';
import { channels } from '@prisma/client';
import PermissionsService from 'services/permissions';
import CommunityService from 'services/community';
import ChannelsService from 'services/channels';
import {
  serialize as serializeSettings,
  Settings,
} from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import { NotFound, RedirectTo } from 'utilities/response';

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const permissions = await PermissionsService.get(context);
  if (!permissions.inbox) {
    return RedirectTo('/signin');
  }
  const community = await CommunityService.find(context);
  if (!community) {
    return NotFound();
  }
  const channels = await ChannelsService.find(community.id);
  return {
    props: {
      communityName: context?.params?.communityName,
      isSubDomainRouting: false,
      settings: serializeSettings(community),
      channels,
      permissions,
    },
  };
}
